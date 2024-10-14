import { schema } from "@blazzing-app/db";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const AddressSchema = createInsertSchema(schema.addresses);

export type InsertAddress = z.infer<typeof AddressSchema>;
export const UpdateAddressSchema = z.object({
	updates: AddressSchema.pick({
		line1: true,
		line2: true,
		postalCode: true,
		state: true,
		city: true,
	}).extend({
		countryCode: z.string().optional(),
	}),
	id: z.string(),
});
export type UpdateAddress = z.infer<typeof UpdateAddressSchema>;
