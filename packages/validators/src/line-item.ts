import { schema } from "@blazzing-app/db";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { ProductSchema, VariantSchema } from "./entities-schema";

const LineItemSchema = createInsertSchema(schema.lineItems);
export const CreateLineItemSchema = z.object({
	lineItem: LineItemSchema.extend({
		variant: VariantSchema.optional(),
		product: ProductSchema.optional(),
	}),
	newCartID: z.string().optional(),
});
export const UpdateLineItemSchema = LineItemSchema.pick({
	quantity: true,
	id: true,
});

export type CreateLineItem = z.infer<typeof CreateLineItemSchema>;
export type UpdateLineItem = z.infer<typeof UpdateLineItemSchema>;
