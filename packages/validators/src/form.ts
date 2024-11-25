import { z } from "zod";

export const FormResponseSchema = z.object({
	type: z.enum(["SUCCESS", "ERROR"] as const),
	message: z.string(),
});

export type FormResponse = z.infer<typeof FormResponseSchema>;

export const ShippingAddressSchema = z.object({
	line1: z.string().min(1, { message: "Must contain at least 1 char" }),
	line2: z.string().nullable(),
	city: z.string().min(1, { message: "Must contain at least 1 char" }),
	state: z.string().min(1, { message: "Must contain at least 1 char" }),
	postalCode: z.string().min(1, { message: "Must contain at least 1 char" }),
	countryCode: z.string(),
});

export type ShippingAddress = z.infer<typeof ShippingAddressSchema>;

export const DeliveryCheckoutFormSchema = z.object({
	fullName: z.string().min(1, { message: "Must contain at least 1 char" }),
	email: z.string().email().optional(),
	phone: z.string().min(3, { message: "Must contain at least 1 char" }),
	shippingAddress: ShippingAddressSchema,
});

export const OnsiteCheckoutFormSchema = z.object({
	fullName: z.string().min(1, { message: "Must contain at least 1 char" }),
	email: z.string().email().optional(),
	phone: z
		.string()
		.min(3, { message: "Must contain at least 1 char" })
		.optional(),
	tableNumber: z.number().optional(),
});
export type DeliveryCheckoutForm = z.infer<typeof DeliveryCheckoutFormSchema>;
export type OnsiteCheckoutForm = z.infer<typeof OnsiteCheckoutFormSchema>;
