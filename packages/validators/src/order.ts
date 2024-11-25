import { schema } from "@blazzing-app/db";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

const OrderSchema = createInsertSchema(schema.orders);

export type InsertOrder = z.infer<typeof OrderSchema>;
export const CreateOrderSchema = z.object({
	order: OrderSchema,
});
export type CreateOrder = z.infer<typeof CreateOrderSchema>;
export const UpdateOrderSchema = z.object({
	updates: OrderSchema.pick({
		billingAddressID: true,
		shippingAddressID: true,
		email: true,
		phone: true,
		fullName: true,
	}),
	id: z.string(),
});
export type UpdateOrder = z.infer<typeof UpdateOrderSchema>;

export const orderStatuses = schema.orders.status.enumValues;
