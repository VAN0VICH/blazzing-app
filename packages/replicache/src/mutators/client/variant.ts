import {
	InvalidValue,
	type DeleteInput,
	type DuplicateVariant,
	type GenerateVariants,
	type InsertVariant,
	type UpdateVariant,
	type VariantDuplicate,
} from "@blazzing-app/validators";
import type { DeepReadonlyObject, WriteTransaction } from "replicache";
import type {
	StorePrice,
	Product,
	StoreProductOptionValue,
	Variant,
} from "../../../../validators/src/store-entities";
import { Effect } from "effect";
import { generateValueCombinations } from "../server/variant";

export function variantNotFound(id: string) {
	console.info(`Variant ${id} not found`);
	throw new Error(`Variant ${id} not found`);
}

async function generateVariants(tx: WriteTransaction, input: GenerateVariants) {
	const { productID, prices, newPricesIDs, newVariantIDs } = input;
	const product = (await tx.get(productID)) as Product | undefined;
	if (!product) {
		return;
	}
	const variants = (await tx.scan<Variant>().values().toArray()).filter(
		(value) => value.productID === productID,
	);
	const options = product.options ?? [];
	const valueToOptionValue = new Map<string, StoreProductOptionValue>();
	for (const option of options) {
		for (const value of option.optionValues ?? []) {
			valueToOptionValue.set(value.value, value);
		}
	}
	const existingValueCombinations = variants.map((variant) =>
		(variant.optionValues ?? []).map((value) => value.optionValue.value),
	);
	const newValueCombinations = generateValueCombinations({
		existingCombos: existingValueCombinations,
		values: options.map((option) =>
			(option.optionValues ?? []).map((value) => value.value),
		),
	});
	await Promise.all(
		newValueCombinations.map((value, index) => {
			const variantID = newVariantIDs[index]!;
			const variant: InsertVariant & {
				prices: StorePrice[];
				optionValues: { optionValue: StoreProductOptionValue }[];
			} = {
				id: variantID,
				title: newValueCombinations[index]!.join("/"),
				createdAt: new Date().toISOString(),
				productID,
				quantity: 1,
				prices: (prices ?? []).map(
					(price, index) =>
						({
							...price,
							id: newPricesIDs[index]!,
							variantID,
							version: 0,
						}) satisfies StorePrice,
				),
				optionValues: value.map((val) => ({
					optionValue: valueToOptionValue.get(val)!,
				})),
			};
			return tx.set(variantID, variant);
		}),
	);
}

async function updateVariant(tx: WriteTransaction, input: UpdateVariant) {
	const { updates, id } = input;

	const variant = await tx.get<Variant>(id);

	if (!variant) {
		return variantNotFound(id);
	}
	await tx.set(id, {
		...variant,
		...updates,
	});
}

async function deleteVariant(tx: WriteTransaction, input: DeleteInput) {
	const { keys } = input;
	await Promise.all(keys.map((key) => tx.del(key)));
}
async function duplicateVariant(tx: WriteTransaction, input: DuplicateVariant) {
	const { duplicates } = input;
	await Effect.runPromise(
		Effect.forEach(duplicates, (_duplicate) => duplicate(tx, _duplicate), {
			concurrency: "unbounded",
		}).pipe(Effect.orDie),
	);
}
const duplicate = (tx: WriteTransaction, duplicate: VariantDuplicate) =>
	Effect.gen(function* () {
		const { originalVariantID, newVariantID, newPriceIDs } = duplicate;
		const variant = yield* Effect.tryPromise(() =>
			tx.get<Variant>(originalVariantID),
		);

		if (!variant) {
			return yield* Effect.fail(`Product ${originalVariantID} not found`);
		}
		const prices = variant.prices ?? [];
		const priceIDtoNewPriceID = new Map<string, string>();
		yield* Effect.forEach(
			prices,
			(price, index) =>
				Effect.sync(() => {
					priceIDtoNewPriceID.set(price.id, newPriceIDs[index]!);
				}),
			{ concurrency: "unbounded" },
		);

		if (prices.length > newPriceIDs.length) {
			return yield* Effect.fail(
				new InvalidValue({
					message: "Mismatched number of new prices id",
				}),
			);
		}
		const newVariant: DeepReadonlyObject<Variant> = {
			...variant,
			id: newVariantID,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			version: 0,
			handle: null,
			productID: variant.productID,
			prices: prices.map(
				(price) =>
					({
						...price,
						id: priceIDtoNewPriceID.get(price.id)!,
						variantID: newVariantID,
						version: 0,
					}) satisfies StorePrice,
			),
		};
		yield* Effect.tryPromise(() => tx.set(newVariant.id, newVariant));
	});

export { generateVariants, updateVariant, deleteVariant, duplicateVariant };
