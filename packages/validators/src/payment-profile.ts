import { schema } from "@blazzing-app/db";
import { createInsertSchema } from "drizzle-zod";
import type { z } from "zod";

export const InsertPaymentProfileSchema = createInsertSchema(
	schema.paymentProfiles,
);
export type InsertPaymentProfile = z.infer<typeof InsertPaymentProfileSchema>;
