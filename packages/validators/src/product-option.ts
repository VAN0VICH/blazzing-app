import { schema } from "@blazzing-app/db";
import type { InferInsertModel } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { ProductOptionValueSchema } from "./product-option-value";

export const InsertProductOptionSchema = createInsertSchema(
	schema.productOptions,
);
export const ProductOptionSchema = createSelectSchema(schema.productOptions);

export const CreateProductOptionSchema = z.object({
	option: InsertProductOptionSchema,
	optionValues: z.optional(z.array(ProductOptionValueSchema)),
});
export type CreateProductOption = z.infer<typeof CreateProductOptionSchema>;
export const UpdateProductOptionSchema = z.object({
	updates: InsertProductOptionSchema.pick({ name: true }),
	optionID: z.string(),
	productID: z.string(),
});
export type UpdateProductOption = z.infer<typeof UpdateProductOptionSchema>;
export const DeleteProductOptionSchema = z.object({
	optionID: z.string(),
	productID: z.string(),
});
export type DeleteProductOption = z.infer<typeof DeleteProductOptionSchema>;
export type InsertProductOption = InferInsertModel<
	typeof schema.productOptions
>;
