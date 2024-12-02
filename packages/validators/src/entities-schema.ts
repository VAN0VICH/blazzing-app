import { ImageSchema, schema } from "@blazzing-app/db";

import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
export const ProductSchema = createSelectSchema(schema.products);
export const VariantSchema = createSelectSchema(schema.variants).extend({
	thumbnail: ImageSchema.optional().nullable(),
	images: z.array(ImageSchema).optional().nullable(),
});
export const UserSchema = createSelectSchema(schema.users);
export const StoreSchema = createSelectSchema(schema.stores);
export const OrderSchema = createSelectSchema(schema.orders);
export const PaymentProfileSchema = createSelectSchema(schema.paymentProfiles);
export const PriceSchema = createSelectSchema(schema.prices);
export const CartSchema = createSelectSchema(schema.carts);
export const LineItemSchema = createSelectSchema(schema.lineItems);
