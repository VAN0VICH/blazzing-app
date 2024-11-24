import { Effect } from "effect";

import {
	CreateProductSchema,
	DuplicateProductSchema,
	InvalidValue,
	NeonDatabaseError,
	NotFound,
	ProductDuplicateSchema,
	UpdateProductSchema,
	type InsertProduct,
	type InsertVariant,
} from "@blazzing-app/validators";

import { schema } from "@blazzing-app/db";
import { Cloudflare, Database } from "@blazzing-app/shared";
import { toUrlFriendly } from "@blazzing-app/utils";
import type {
	Price,
	ProductOption,
	ProductOptionValue,
	Variant,
} from "@blazzing-app/validators/server";
import { and, eq, isNotNull } from "drizzle-orm";
import { z } from "zod";
import { TableMutator } from "../../context/table-mutator";
import { fn } from "../../util/fn";

const createProduct = fn(CreateProductSchema, (input) =>
	Effect.gen(function* () {
		const tableMutator = yield* TableMutator;
		const { product } = input;
		const baseVariant: InsertVariant = {
			id: product.baseVariantID,
			productID: product.id,
			quantity: 1,
		};
		yield* tableMutator.set(product, "products");
		yield* tableMutator.set(baseVariant, "variants");
	}),
);

const deleteProduct = fn(
	z.object({
		keys: z.array(z.string()),
	}),
	(input) =>
		Effect.gen(function* () {
			const tableMutator = yield* TableMutator;
			const { keys } = input;

			return yield* tableMutator.delete(keys, "products");
		}),
);

const updateProduct = fn(UpdateProductSchema, (input) =>
	Effect.gen(function* () {
		const tableMutator = yield* TableMutator;
		const { manager } = yield* Database;
		const { updates, id, storeID } = input;
		yield* Effect.all(
			[
				tableMutator.update(id, updates, "products"),
				storeID
					? tableMutator.update(storeID, {}, "stores")
					: Effect.succeed({}),
			],
			{ concurrency: 2 },
		);
		if (updates.status) {
			/* delete all the existing line items in the cart so that the user doesn't accidentally buy a product with a modified price */
			yield* Effect.tryPromise(() =>
				manager
					.delete(schema.lineItems)
					.where(
						and(
							eq(schema.lineItems.productID, id),
							isNotNull(schema.lineItems.cartID),
						),
					),
			).pipe(
				Effect.catchTags({
					UnknownException: (error) =>
						new NeonDatabaseError({ message: error.message }),
				}),
			);
		}
	}),
);

const publishProduct = fn(z.object({ id: z.string() }), (input) =>
	Effect.gen(function* () {
		const tableMutator = yield* TableMutator;
		const { manager } = yield* Database;
		const { bindings } = yield* Cloudflare;
		const { id } = input;
		const product = yield* Effect.tryPromise(() =>
			manager.query.products.findFirst({
				where: (products, { eq }) => eq(products.id, id),
				with: {
					variants: {
						with: {
							optionValues: {
								with: {
									optionValue: true,
								},
							},
						},
					},
					baseVariant: true,
				},
			}),
		).pipe(
			Effect.catchTags({
				UnknownException: (error) =>
					new NeonDatabaseError({ message: error.message }),
			}),
		);

		if (!product) {
			return yield* Effect.succeed({});
		}
		const effects =
			product.variants?.map((variant) => {
				const handle = toUrlFriendly(
					variant.handle
						? variant.handle
						: `${product.baseVariant.title ?? ""}${variant.optionValues.length > 0 ? "-" : ""}${
								variant.optionValues.length > 0
									? variant.optionValues
											.map((val) => val.optionValue.value)
											.join("-")
									: ""
							}`,
				);
				console.log("HANDLE <____", handle);
				return tableMutator.update(
					variant.id,
					{
						handle,
					},
					"variants",
				);
			}) ?? [];

		effects.push(
			tableMutator.update(
				id,
				{
					status: "published",
				},
				"products",
			),
		);
		yield* Effect.all(effects, { concurrency: "unbounded" });
		yield* Effect.all([
			Effect.tryPromise(() => bindings.KV.delete(`product_${product.id}`)),
			Effect.tryPromise(() =>
				bindings.KV.delete(`product_${product.baseVariant.handle}`),
			),
		]).pipe(
			Effect.catchTags({
				UnknownException: () => Effect.succeed({}),
			}),
		);
	}),
);
const copyProduct = fn(DuplicateProductSchema, (input) =>
	Effect.gen(function* () {
		const { duplicates } = input;
		yield* Effect.forEach(duplicates, (_duplicate) => duplicate(_duplicate), {
			concurrency: "unbounded",
		});
	}),
);

//TODO : add collection
const duplicate = fn(ProductDuplicateSchema, (input) =>
	Effect.gen(function* () {
		const tableMutator = yield* TableMutator;
		const { manager } = yield* Database;
		const {
			newBaseVariantID,
			newOptionIDs,
			newOptionValueIDs,
			newPriceIDs,
			newProductID,
			originalProductID,
		} = input;
		const product = yield* Effect.tryPromise(() =>
			manager.query.products.findFirst({
				where: (products, { eq }) => eq(products.id, originalProductID),
				with: {
					baseVariant: {
						with: {
							prices: true,
						},
					},
					options: {
						with: {
							optionValues: true,
						},
					},
				},
			}),
		).pipe(
			Effect.catchTags({
				UnknownException: (error) =>
					new NeonDatabaseError({ message: error.message }),
			}),
		);
		if (!product) {
			return yield* Effect.fail(
				new NotFound({
					message: `Product not found: id ${originalProductID}`,
				}),
			);
		}
		const baseVariant = product.baseVariant;
		const prices = baseVariant.prices;
		const options = product.options;
		const optionValues = product.options.flatMap(
			(option) => option.optionValues,
		);
		const optionIDtoNewOptionID = new Map<string, string>();
		const optionValueIDtoNewOptionValueID = new Map<string, string>();
		const priceIDtoNewPriceID = new Map<string, string>();
		yield* Effect.all(
			[
				Effect.forEach(
					options,
					(option, index) =>
						Effect.sync(() => {
							optionIDtoNewOptionID.set(option.id, newOptionIDs[index]!);
						}),
					{ concurrency: "unbounded" },
				),
				Effect.forEach(
					optionValues,
					(optionValue, index) =>
						Effect.sync(() => {
							optionValueIDtoNewOptionValueID.set(
								optionValue.id,
								newOptionValueIDs[index]!,
							);
						}),
					{ concurrency: "unbounded" },
				),

				Effect.forEach(
					prices,
					(price, index) =>
						Effect.sync(() => {
							priceIDtoNewPriceID.set(price.id, newPriceIDs[index]!);
						}),
					{ concurrency: "unbounded" },
				),
			],
			{ concurrency: 3 },
		);
		if (
			prices.length > newPriceIDs.length ||
			options.length > newOptionIDs.length ||
			optionValues.length > newOptionValueIDs.length
		) {
			return yield* Effect.fail(
				new InvalidValue({
					message:
						"Mismatched number of new prices id, options id, or option values id.",
				}),
			);
		}

		yield* tableMutator.set(
			{
				id: newProductID,
				collectionID: product.collectionID,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				baseVariantID: newBaseVariantID,
				metadata: product.metadata,
				score: 0,
				status: "draft",
				storeID: product.storeID,
				version: 0,
				updatedBy: null,
				type: "digital",
			} satisfies InsertProduct,
			"products",
		);

		yield* tableMutator.set(
			{
				id: newBaseVariantID,
				productID: newProductID,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				version: 0,
				allowBackorder: baseVariant.allowBackorder,
				quantity: baseVariant.quantity,
				barcode: baseVariant.barcode,
				images: baseVariant.images,
				metadata: baseVariant.metadata,
				handle: null,
				sku: baseVariant.sku,
				title: baseVariant.title,
				thumbnail: baseVariant.thumbnail,
				updatedBy: null,
				weight: baseVariant.weight,
				weightUnit: baseVariant.weightUnit,
				description: baseVariant.description,
				height: baseVariant.height,
				length: baseVariant.length,
				material: baseVariant.material,
				originCountry: baseVariant.originCountry,
				width: baseVariant.width,
				discountable: baseVariant.discountable,
			} satisfies Variant,
			"variants",
		);

		yield* Effect.all(
			[
				Effect.forEach(
					prices,
					(price) => {
						return tableMutator.set(
							{
								...price,
								id: priceIDtoNewPriceID.get(price.id)!,
								variantID: newBaseVariantID,
								version: 0,
							} satisfies Price,
							"prices",
						);
					},
					{ concurrency: "unbounded" },
				),
				Effect.forEach(
					options,
					(option) =>
						Effect.gen(function* () {
							return yield* tableMutator.set(
								{
									id: optionIDtoNewOptionID.get(option.id)!,
									name: option.name,
									productID: newProductID,
									version: 0,
								} satisfies ProductOption,
								"productOptions",
							);
						}),
					{ concurrency: "unbounded" },
				),
			],
			{
				concurrency: 2,
			},
		);

		yield* Effect.forEach(
			optionValues,
			(optionValue) => {
				return tableMutator.set(
					{
						...optionValue,
						id: optionValueIDtoNewOptionValueID.get(optionValue.id)!,
						optionID: optionIDtoNewOptionID.get(optionValue.optionID)!,
						version: 0,
					} satisfies ProductOptionValue,
					"productOptionValues",
				);
			},
			{ concurrency: "unbounded" },
		);
	}),
);

export {
	copyProduct,
	createProduct,
	deleteProduct,
	publishProduct,
	updateProduct,
};
