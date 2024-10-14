import { schema } from "@blazzing-app/db";
import { createInsertSchema } from "drizzle-zod";
import type { z } from "zod";

export const InsertStripeSchema = createInsertSchema(schema.stripe);
export type InsertStripeProfile = z.infer<typeof InsertStripeSchema>;
export const StripeUpdatesSchema = InsertStripeSchema.pick({
	isOnboarded: true,
});
export type StripeUpdates = z.infer<typeof StripeUpdatesSchema>;
