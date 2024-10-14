import { schema } from "@blazzing-app/db";
import type { InferInsertModel } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const ProductOptionValueSchema = createInsertSchema(
	schema.productOptionValues,
);
export const UpdateProductOptionValuesSchema = z.object({
	productID: z.string(),
	optionID: z.string(),
	newOptionValues: z.array(ProductOptionValueSchema),
});
export type UpdateProductOptionValues = z.infer<
	typeof UpdateProductOptionValuesSchema
>;
export const DeleteProductOptionValueSchema = z.object({
	optionValueID: z.string(),
	productID: z.string(),
});
export type DeleteProductOptionValue = z.infer<
	typeof DeleteProductOptionValueSchema
>;
export type InsertProductOptionValue = InferInsertModel<
	typeof schema.productOptionValues
>;

export const AssignOptionValueToVariantSchema = z.object({
	optionValueID: z.string(),
	variantID: z.string(),
	prevOptionValueID: z.string().optional(),
	productID: z.string(),
});
export type AssignOptionValueToVariant = z.infer<
	typeof AssignOptionValueToVariantSchema
>;
