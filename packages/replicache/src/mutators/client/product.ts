import type { WriteTransaction } from "replicache";

import {
	ClientMutatorError,
	InvalidValue,
	NotFound,
	type CreateProduct,
	type DuplicateProduct,
	type InsertVariant,
	type Product,
	type ProductDuplicate,
	type StorePrice,
	type UpdateProduct,
	type Variant,
} from "@blazzing-app/validators";
import { Effect } from "effect";

export function productNotFound(id: string) {
	console.info(`Product ${id} not found`);
	throw new Error(`Product ${id} not found`);
}

async function createProduct(tx: WriteTransaction, input: CreateProduct) {
	const { product } = input;
	const baseVariant: InsertVariant = {
		id: product.baseVariantID,
		quantity: 1,
		productID: product.id,
	};

	await tx.set(product.id, { ...product, baseVariant });
	await tx.set(baseVariant.id, baseVariant);
}

async function deleteProduct(tx: WriteTransaction, input: { keys: string[] }) {
	const { keys } = input;
	await Promise.all(keys.map((key) => tx.del(key)));
}

async function updateProduct(tx: WriteTransaction, input: UpdateProduct) {
	const { updates, id } = input;
	const product = await tx.get<Product>(id);

	if (!product) {
		return productNotFound(id);
	}
	await tx.set(id, {
		...product,
		...updates,
	});
}

async function publishProduct(tx: WriteTransaction, input: { id: string }) {
	const { id } = input;
	const product = await tx.get<Product>(id);

	if (!product) {
		return productNotFound(id);
	}
	await tx.set(id, {
		...product,
		status: "published",
	});
}
async function copyProduct(tx: WriteTransaction, input: DuplicateProduct) {
	const { duplicates } = input;
	await Effect.runPromise(
		Effect.forEach(duplicates, (_duplicate) => duplicate(tx, _duplicate), {
			concurrency: "unbounded",
		}).pipe(
			Effect.catchTags({
				UnknownException: (error) => {
					console.error("Error duplicating product", error);
					return new ClientMutatorError({
						message: "Mutator error",
					});
				},
			}),
			Effect.orDie,
		),
	);
}
const duplicate = (tx: WriteTransaction, duplicate: ProductDuplicate) =>
	Effect.gen(function* () {
		const {
			newBaseVariantID,
			newOptionIDs,
			newOptionValueIDs,
			newPriceIDs,
			newProductID,
			originalProductID,
		} = duplicate;
		const product = (yield* Effect.tryPromise(() =>
			tx.get(originalProductID),
		)) as Product | undefined;

		if (!product) {
			return yield* Effect.fail(
				new NotFound({ message: `Product ${originalProductID} not found` }),
			);
		}

		const baseVariant = (yield* Effect.tryPromise(() =>
			tx.get(product.baseVariantID),
		)) as Variant | undefined;

		if (!baseVariant) {
			return yield* Effect.fail(
				new NotFound({
					message: `Default variant ${product.baseVariantID} not found`,
				}),
			);
		}

		const prices = baseVariant.prices ?? [];
		const options = product.options ?? [];
		const optionValues = options.flatMap((option) => option.optionValues ?? []);
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
				Effect.forEach(prices, (price, index) =>
					Effect.sync(() => {
						priceIDtoNewPriceID.set(price.id, newPriceIDs[index]!);
					}),
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
		const newDefaultVariant: Variant = {
			...baseVariant,
			id: newBaseVariantID,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			version: 0,
			handle: null,
			productID: newProductID,
			prices: prices.map(
				(price) =>
					({
						...price,
						id: priceIDtoNewPriceID.get(price.id)!,
						variantID: newBaseVariantID,
						version: 0,
					}) satisfies StorePrice,
			),

			optionValues: (baseVariant.optionValues ?? []).map((value) => ({
				optionValue: {
					id: optionValueIDtoNewOptionValueID.get(value.optionValue.id)!,
					option: {
						...value.optionValue.option,
						id: optionIDtoNewOptionID.get(value.optionValue.optionID)!,
						productID: newProductID,
						version: 0,
					},
					optionID: optionIDtoNewOptionID.get(value.optionValue.optionID)!,
					version: 0,
					value: value.optionValue.value,
				},
			})),
		};
		//TODO : add collection
		yield* Effect.tryPromise(() =>
			tx.set(newProductID, {
				...product,
				id: newProductID,

				baseVariantID: newBaseVariantID,
				baseVariant: newDefaultVariant,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				variants: [],
				metadata: null,
				options: options.map((option) => ({
					...option,
					id: optionIDtoNewOptionID.get(option.id)!,
					optionValues: option.optionValues
						? option.optionValues?.map((value) => ({
								...value,
								id: optionValueIDtoNewOptionValueID.get(value.id)!,
								optionID: optionIDtoNewOptionID.get(value.optionID)!,
								version: 0,
							}))
						: [],
				})),
				version: 0,
				status: "draft",
			} satisfies Product),
		);
		yield* Effect.tryPromise(() => tx.set(newBaseVariantID, newDefaultVariant));
	});
export {
	createProduct,
	deleteProduct,
	copyProduct,
	publishProduct,
	updateProduct,
};
