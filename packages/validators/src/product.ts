import { z } from "zod";

import { schema } from "@blazzing-app/db";
import { createInsertSchema } from "drizzle-zod";
import { ProductSchema } from "./entities-schema";
import { InsertVariantSchema } from "./variant";

export const productStatuses = schema.productStatus;
export const productTypes = schema.productType;

const InsertProductSchema = createInsertSchema(schema.products).extend({
	baseVariant: InsertVariantSchema.optional(),
});
export const PublishedProductSchema = ProductSchema;
export type InsertProduct = z.infer<typeof InsertProductSchema>;
export const CreateProductSchema = z.object({
	product: InsertProductSchema,
});
export type CreateProduct = z.infer<typeof CreateProductSchema>;

const ProductUpdatesSchema = InsertProductSchema.pick({
	collectionID: true,
	status: true,
	collectionHandle: true,
	available: true,
	type: true,
}).extend({
	type: z.enum(productStatuses).optional(),
	available: z.boolean().optional(),
});

export const UpdateProductSchema = z.object({
	updates: ProductUpdatesSchema,
	storeID: z.string().optional(),
	id: z.string(),
});
export type UpdateProduct = z.infer<typeof UpdateProductSchema>;

export const ProductDuplicateSchema = z.object({
	originalProductID: z.string(),
	newBaseVariantID: z.string(),
	newProductID: z.string(),
	newPriceIDs: z.array(z.string()),
	newOptionIDs: z.array(z.string()),
	newOptionValueIDs: z.array(z.string()),
});

export type ProductDuplicate = z.infer<typeof ProductDuplicateSchema>;

export const DuplicateProductSchema = z.object({
	duplicates: z.array(ProductDuplicateSchema),
});
export type DuplicateProduct = z.infer<typeof DuplicateProductSchema>;
