import { schema } from "@blazzing-app/db";
import { Database } from "@blazzing-app/shared";
import {
	AssignOptionValueToVariantSchema,
	DeleteProductOptionValueSchema,
	NeonDatabaseError,
	NotFound,
	UpdateProductOptionValuesSchema,
} from "@blazzing-app/validators";
import type { Server } from "@blazzing-app/validators";
import { eq } from "drizzle-orm";
import { Effect } from "effect";
import { TableMutator } from "../../context/table-mutator";
import { fn } from "../../util/fn";

const updateProductOptionValues = fn(UpdateProductOptionValuesSchema, (input) =>
	Effect.gen(function* () {
		const tableMutator = yield* TableMutator;
		const { manager } = yield* Database;
		const { optionID, newOptionValues, productID } = input;
		const option = yield* Effect.tryPromise(() =>
			manager.query.productOptions.findFirst({
				where: (productOptions, { eq }) => eq(productOptions.id, optionID),
				with: {
					optionValues: true,
				},
			}),
		).pipe(
			Effect.catchTags({
				UnknownException: (error) =>
					new NeonDatabaseError({ message: error.message }),
			}),
		);

		if (!option) {
			return yield* Effect.fail(new NotFound({ message: "Option not found" }));
		}
		const oldOptionValuesSet = new Set(
			option.optionValues?.map((val) => val.value) ?? [],
		);
		const newOptionValuesSet = new Set(newOptionValues.map((val) => val.value));

		const optionValuesToCreate: Server.ProductOptionValue[] = [];
		const optionValueIDsToDelete: string[] = [];

		yield* Effect.forEach(newOptionValues, (val) =>
			Effect.sync(() => {
				if (!oldOptionValuesSet.has(val.value)) {
					optionValuesToCreate.push({
						id: val.id,
						optionID,
						value: val.value,
						version: 0,
					});
				}
			}),
		);
		yield* Effect.forEach(option.optionValues ?? [], (val) =>
			Effect.sync(() => {
				if (!newOptionValuesSet.has(val.value)) {
					optionValueIDsToDelete.push(val.id);
				}
			}),
		);

		const setOptionValues = tableMutator.set(
			optionValuesToCreate,
			"productOptionValues",
		);

		const updateProduct = tableMutator.update(productID, {}, "products");
		const effects = [setOptionValues, updateProduct];
		optionValueIDsToDelete.length > 0 &&
			effects.push(
				tableMutator.delete(optionValueIDsToDelete, "productOptionValues"),
			);

		return yield* Effect.all(effects, {
			concurrency: 3,
		});
	}),
);

const deleteProductOptionValue = fn(DeleteProductOptionValueSchema, (input) =>
	Effect.gen(function* () {
		const tableMutator = yield* TableMutator;
		const { optionValueID, productID } = input;

		const productOptionValueDelete = tableMutator.delete(
			optionValueID,
			"productOptionValues",
		);

		const productUpdate = tableMutator.update(productID, {}, "products");

		return yield* Effect.all([productOptionValueDelete, productUpdate], {
			concurrency: 2,
		});
	}),
);

const assignOptionValueToVariant = fn(
	AssignOptionValueToVariantSchema,
	(input) =>
		Effect.gen(function* () {
			const tableMutator = yield* TableMutator;
			const { manager } = yield* Database;
			const { optionValueID, variantID, prevOptionValueID } = input;
			if (prevOptionValueID)
				yield* Effect.tryPromise(() =>
					manager
						.delete(schema.productOptionValuesToVariants)
						.where(
							eq(
								schema.productOptionValuesToVariants.optionValueID,
								prevOptionValueID,
							),
						),
				).pipe(
					Effect.catchTags({
						UnknownException: (error) =>
							new NeonDatabaseError({ message: error.message }),
					}),
				);

			const setRelationship = tableMutator.set(
				{ optionValueID, variantID, id: "whatever" },
				"productOptionValuesToVariants",
			);
			const updateVariant = tableMutator.update(variantID, {}, "variants");
			const effects = [setRelationship, updateVariant];

			return yield* Effect.all(effects, { concurrency: 2 });
		}),
);
export {
	assignOptionValueToVariant,
	deleteProductOptionValue,
	updateProductOptionValues,
};
