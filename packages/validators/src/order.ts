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
		status: true,
		paymentStatus: true,
		type: true,
		tableNumber: true,
		id: true,
	}).extend({
		type: z.enum(["delivery", "onsite", "takeout"] as const).optional(),
		id: z.string().optional(),
	}),
	id: z.string(),
});
export type UpdateOrder = z.infer<typeof UpdateOrderSchema>;

export const orderStatuses = schema.orders.status.enumValues;
export const orderPaymentStatuses = schema.orders.paymentStatus.enumValues;
export const orderTypes = schema.orders.type.enumValues;
