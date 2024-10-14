import type {
	CreateProductOption,
	DeleteProductOption,
	UpdateProductOption,
} from "@blazzing-app/validators";
import type { Product } from "@blazzing-app/validators/client";
import type { WriteTransaction } from "replicache";
import { productNotFound } from "./product";

async function createProductOption(
	tx: WriteTransaction,
	input: CreateProductOption,
) {
	const { option, optionValues } = input;

	const product = await tx.get<Product>(option.productID);

	if (!product) {
		return productNotFound(option.productID);
	}
	const productOptions = product.options ? product.options : [];

	await tx.set(product.id, {
		...product,
		options: [...productOptions, { ...option, optionValues }],
	});
}

async function updateProductOption(
	tx: WriteTransaction,
	input: UpdateProductOption,
) {
	const { optionID, productID, updates } = input;

	const product = await tx.get<Product>(productID);

	if (!product) {
		return productNotFound(productID);
	}

	await tx.set(productID, {
		...product,
		options: product.options?.map((option) =>
			option.id === optionID ? { ...option, ...updates } : option,
		),
	});
}

async function deleteProductOption(
	tx: WriteTransaction,
	input: DeleteProductOption,
) {
	const { optionID, productID } = input;

	const product = await tx.get<Product>(productID);

	if (!product) {
		return productNotFound(productID);
	}
	const options = product.options
		? product.options.filter((option) => option.id !== optionID)
		: [];

	await tx.set(productID, {
		...product,
		options,
	});
}

export { createProductOption, deleteProductOption, updateProductOption };
