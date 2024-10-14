import { schema } from "@blazzing-app/db";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const InsertPriceSchema = createInsertSchema(schema.prices);
export type InsertPrice = z.infer<typeof InsertPriceSchema>;
export const PriceSchema = createSelectSchema(schema.prices);
export type Price = z.infer<typeof PriceSchema>;

export const CreatePricesSchema = z.object({
	prices: z.array(InsertPriceSchema),
	id: z.string(),
});
export type CreatePrices = z.infer<typeof CreatePricesSchema>;
export const UpdatePriceSchema = z.object({
	priceID: z.string(),
	id: z.string(),
	updates: InsertPriceSchema.pick({ amount: true }),
});
export type UpdatePrice = z.infer<typeof UpdatePriceSchema>;
export const DeletePricesSchema = z.object({
	priceIDs: z.array(z.string()),
	id: z.string(),
});
export type DeletePrices = z.infer<typeof DeletePricesSchema>;
