import { schema } from "@blazzing-app/db";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { PriceSchema, ProductSchema } from "./entities-schema";

const LineItemSchema = createInsertSchema(schema.lineItems);
const VariantSchema = createInsertSchema(schema.variants);
export const CreateLineItemSchema = z.object({
	lineItem: LineItemSchema.extend({
		variant: VariantSchema.extend({
			prices: z.array(PriceSchema),
			available: z.boolean().nullable().optional(),
		}).optional(),
		product: ProductSchema.extend({
			available: z.boolean().nullable().optional(),
		}).optional(),
	}),
	newCartID: z.string().optional(),
});
export const UpdateLineItemSchema = LineItemSchema.pick({
	quantity: true,
	id: true,
	orderID: true,
});

export type CreateLineItem = z.infer<typeof CreateLineItemSchema>;
export type UpdateLineItem = z.infer<typeof UpdateLineItemSchema>;
