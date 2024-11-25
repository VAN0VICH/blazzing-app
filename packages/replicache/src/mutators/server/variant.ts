import { Database } from "@blazzing-app/shared";
import {
	DeleteInputSchema,
	DuplicateVariantSchema,
	GenerateVariantsSchema,
	NeonDatabaseError,
	NotFound,
	UpdateVariantSchema,
	VariantDuplicateSchema,
	type InsertVariant,
} from "@blazzing-app/validators";
import type { Server } from "@blazzing-app/validators";
import { Effect } from "effect";
import { TableMutator } from "../../context/table-mutator";
import { fn } from "../../util/fn";
import { createPrices } from "./price";
import { schema } from "@blazzing-app/db";
import { eq, sql } from "drizzle-orm";

const generateVariants = fn(GenerateVariantsSchema, (input) =>
	Effect.gen(function* () {
		const { productID, prices, newPricesIDs, newVariantIDs } = input;
		const { manager } = yield* Database;
		const tableMutator = yield* TableMutator;
		const product = yield* Effect.tryPromise(() =>
			manager.query.products.findFirst({
				where: (products, { eq }) => eq(products.id, productID),
				with: {
					options: {
						with: {
							optionValues: true,
						},
					},
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
			return yield* Effect.fail(
				new NotFound({
					message: `product not found: id ${productID}`,
				}),
			);
		}

		const options = product.options;
		const valueToOptionValue = new Map<string, Server.ProductOptionValue>();
		for (const option of options) {
			for (const value of option.optionValues) {
				valueToOptionValue.set(value.value, value);
			}
		}
		const existingValueCombinations = product.variants.map((variant) =>
			variant.optionValues.map((value) => value.optionValue.value),
		);
		const newValueCombinations = generateValueCombinations({
			existingCombos: existingValueCombinations,
			values: options.map((option) =>
				option.optionValues.map((value) => value.value),
			),
		});
		const newVariants: InsertVariant[] = newValueCombinations.map(
			(_, index) => ({
				id: newVariantIDs[index]!,
				productID,
				...(product.status === "published" && {
					handle: `${product.baseVariant.title ?? ""}${(newValueCombinations[index] ?? []).length > 0 ? "-" : ""}${
						(newValueCombinations[index] ?? []).length > 0
							? newValueCombinations[index]!.join("-")
							: ""
					}`,
				}),
				createdAt: new Date().toISOString(),
				quantity: 1,
				title: newValueCombinations[index]!.join("/"),
			}),
		);
		yield* tableMutator.set(newVariants, "variants");
		const assignOptionValueToVariant = Effect.forEach(
			newValueCombinations,
			(values, index) =>
				Effect.gen(function* () {
					const variant = newVariants[index]!;
					yield* Effect.forEach(values, (value) =>
						Effect.gen(function* () {
							const optionValue = valueToOptionValue.get(value)!;
							yield* tableMutator.set(
								{
									optionValueID: optionValue.id,
									variantID: variant.id,
									id: "whatever",
								},
								"productOptionValuesToVariants",
							);
						}),
					);
				}),
		);
		const createPriceForVariant = Effect.forEach(newVariants, (variant) =>
			createPrices({
				prices: (prices ?? []).map((p, index) => ({
					...p,
					id: newPricesIDs[index]!,
					variantID: variant.id,
				})),
				id: variant.id,
			}),
		);
		yield* Effect.all([assignOptionValueToVariant, createPriceForVariant], {
			concurrency: 2,
		});
	}),
);

const deleteVariant = fn(DeleteInputSchema, (input) =>
	Effect.gen(function* () {
		const tableMutator = yield* TableMutator;
		const { keys } = input;

		yield* tableMutator.delete(keys, "variants");
	}),
);

const updateVariant = fn(UpdateVariantSchema, (input) =>
	Effect.gen(function* () {
		const tableMutator = yield* TableMutator;
		const { manager } = yield* Database;
		const { id, updates } = input;

		yield* Effect.all(
			[
				tableMutator.update(id, updates, "variants"),
				Effect.tryPromise(() =>
					manager
						.update(schema.products)
						.set({ version: sql`${schema.products.version} + 1` })
						.where(eq(schema.products.baseVariantID, id)),
				).pipe(Effect.orDie),
			],
			{
				concurrency: 2,
			},
		);
	}),
);
const duplicateVariant = fn(DuplicateVariantSchema, (input) =>
	Effect.gen(function* () {
		const { duplicates } = input;
		yield* Effect.forEach(duplicates, (_duplicate) => duplicate(_duplicate), {
			concurrency: "unbounded",
		});
	}),
);
const duplicate = fn(VariantDuplicateSchema, (input) =>
	Effect.gen(function* () {
		const { newVariantID, newPriceIDs, originalVariantID } = input;
		const { manager } = yield* Database;
		const tableMutator = yield* TableMutator;
		const variant = yield* Effect.tryPromise(() =>
			manager.query.variants.findFirst({
				where: (variants, { eq }) => eq(variants.id, originalVariantID),
				with: {
					prices: true,
					optionValues: {
						with: {
							optionValue: true,
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
		if (!variant) {
			return yield* Effect.fail(
				new NotFound({
					message: `variant not found: id ${originalVariantID}`,
				}),
			);
		}
		const priceIDtoNewPriceID = new Map<string, string>();

		yield* Effect.forEach(
			variant.prices,
			(price, index) =>
				Effect.sync(() => {
					priceIDtoNewPriceID.set(price.id, newPriceIDs[index]!);
				}),
			{ concurrency: "unbounded" },
		);
		yield* tableMutator.set(
			{
				id: newVariantID,
				productID: variant.productID,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				version: 0,
				allowBackorder: variant.allowBackorder,
				description: variant.description,
				quantity: variant.quantity,
				barcode: variant.barcode,
				images: variant.images,
				metadata: variant.metadata,
				handle: null,
				sku: variant.sku,
				title: variant.title,
				thumbnail: variant.thumbnail,
				updatedBy: null,
				weight: variant.weight,
				weightUnit: variant.weightUnit,
				height: variant.height,
				length: variant.length,
				material: variant.material,
				originCountry: variant.originCountry,
				width: variant.width,
				discountable: variant.discountable,
			} satisfies Server.Variant,
			"variants",
		);
		yield* Effect.all(
			[
				Effect.forEach(
					variant.prices,
					(price, index) => {
						return tableMutator.set(
							{
								...price,
								id: newPriceIDs[index]!,
								variantID: newVariantID,
								version: 0,
							} satisfies Server.Price,
							"prices",
						);
					},
					{ concurrency: "unbounded" },
				),
				Effect.forEach(
					variant.optionValues,
					(value) =>
						tableMutator.set(
							{
								optionValueID: value.optionValue.id,
								variantID: newVariantID,
								id: "whatever",
							},
							"productOptionValuesToVariants",
						),
					{ concurrency: "unbounded" },
				),
			],
			{
				concurrency: 2,
			},
		);
	}),
);

function generateValueCombinations({
	existingCombos,
	values,
}: {
	existingCombos: string[][];
	values: string[][];
}): string[][] {
	const result: string[][] = [];
	const temp: string[] = [];

	function backtrack(start: number) {
		if (temp.length === values.length) {
			const combination = [...temp];
			if (
				!existingCombos.some((existingCombo) =>
					arraysEqual(existingCombo, combination),
				)
			) {
				result.push(combination);
			}
			return;
		}

		for (let i = start; i < values.length; i++) {
			for (const value of values[i]!) {
				temp.push(value);
				backtrack(i + 1);
				temp.pop();
			}
		}
	}

	function arraysEqual(a: string[], b: string[]): boolean {
		if (a.length !== b.length) return false;
		const bSet = new Set(b);
		return a.every((item) => bSet.has(item));
	}

	backtrack(0);
	return result;
}
export {
	deleteVariant,
	duplicateVariant,
	generateValueCombinations,
	generateVariants,
	updateVariant,
};
