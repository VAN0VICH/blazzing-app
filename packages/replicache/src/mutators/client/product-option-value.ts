import type {
	AssignOptionValueToVariant,
	DeleteProductOptionValue,
	UpdateProductOptionValues,
} from "@blazzing-app/validators";
import type {
	Product,
	StoreProductOptionValue,
	Variant,
} from "../../../../validators/src/store-entities";
import type { WriteTransaction } from "replicache";
import { productNotFound } from "./product";
import { variantNotFound } from "./variant";

async function updateProductOptionValues(
	tx: WriteTransaction,
	input: UpdateProductOptionValues,
) {
	const { optionID, newOptionValues, productID } = input;

	const product = (await tx.get(productID)) as Product | undefined;

	if (!product) {
		return productNotFound(productID);
	}
	const valueToOptionValue = new Map<string, StoreProductOptionValue>();
	for (const optionValue of product.options?.find(
		(option) => option.id === optionID,
	)?.optionValues ?? []) {
		valueToOptionValue.set(optionValue.value, optionValue);
	}

	await tx.set(productID, {
		...product,
		options: product.options?.map((option) =>
			option.id === optionID
				? {
						...option,
						optionValues: newOptionValues.map((value) => {
							const existingValue = valueToOptionValue.get(value.value);
							if (existingValue) return existingValue;

							return value;
						}),
					}
				: option,
		),
	});
}

async function deleteProductOptionValue(
	tx: WriteTransaction,
	input: DeleteProductOptionValue,
) {
	const { optionValueID, productID } = input;

	const product = await tx.get<Product>(productID);

	if (!product) {
		return productNotFound(productID);
	}

	await tx.set(productID, {
		...product,
		options: product.options?.map((option) =>
			option.id === optionValueID
				? {
						...option,
						optionValues: option.optionValues?.filter(
							(value) => value.id !== optionValueID,
						),
					}
				: option,
		),
	});
}

/* ->VARIANT<- option values must have the shape of {optionValue: Client.ProductOptionValue}
due to drizzle's many to many relationship setup */
async function assignOptionValueToVariant(
	tx: WriteTransaction,
	input: AssignOptionValueToVariant,
) {
	const { optionValueID, prevOptionValueID, variantID, productID } = input;

	const product = (await tx.get(productID)) as Product | undefined;

	const variant = (await tx.get(variantID)) as Variant | undefined;

	if (!product) {
		return productNotFound(input.productID);
	}
	if (!variant) {
		return variantNotFound(variantID);
	}
	let productOptionValue: StoreProductOptionValue | undefined;

	for (const option of product.options || []) {
		productOptionValue = option.optionValues?.find(
			(value) => value.id === optionValueID,
		);
		if (productOptionValue) break;
	}

	const newOptionValues: { optionValue: StoreProductOptionValue }[] = [];
	for (const value of variant.optionValues ?? []) {
		if (value.optionValue.id !== prevOptionValueID) {
			newOptionValues.push({ optionValue: value.optionValue });
		}
	}
	if (productOptionValue)
		newOptionValues.push({ optionValue: productOptionValue });

	if (productOptionValue)
		await tx.set(variant.id, {
			...variant,
			optionValues: newOptionValues,
		});
}
export {
	deleteProductOptionValue,
	updateProductOptionValues,
	assignOptionValueToVariant,
};
