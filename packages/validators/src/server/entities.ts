import { ImageSchema, schema } from "@blazzing-app/db";

import type { InferSelectModel } from "drizzle-orm";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export type AuthUser = InferSelectModel<typeof schema.authUsers>;
export type Store = InferSelectModel<typeof schema.stores>;
export type User = InferSelectModel<typeof schema.users>;
export type Address = InferSelectModel<typeof schema.addresses>;
export type Price = InferSelectModel<typeof schema.prices>;
export type Collection = InferSelectModel<typeof schema.collections>;
export type ProductOption = InferSelectModel<typeof schema.productOptions>;
export type ProductOptionValue = InferSelectModel<
	typeof schema.productOptionValues
>;
export type Tag = InferSelectModel<typeof schema.tags>;
export type Variant = InferSelectModel<typeof schema.variants>;
export type Product = InferSelectModel<typeof schema.products>;
export type Cart = InferSelectModel<typeof schema.carts>;
export type LineItem = InferSelectModel<typeof schema.lineItems>;
export type Order = InferSelectModel<typeof schema.orders>;
export type ClientError = InferSelectModel<typeof schema.clientErrors>;
export type Notification = InferSelectModel<typeof schema.notifications>;
export type Verification = InferSelectModel<typeof schema.verifications>;
export type Session = InferSelectModel<typeof schema.sessions>;
export type Customer = InferSelectModel<typeof schema.customers>;
export type PaymentProfile = InferSelectModel<typeof schema.paymentProfiles>;
export type StripeAccount = InferSelectModel<typeof schema.stripe>;

export const ProductSchema = createSelectSchema(schema.products);
export const VariantSchema = createSelectSchema(schema.variants).extend({
	thumbnail: ImageSchema.optional().nullable(),
	images: z.array(ImageSchema).optional().nullable(),
});
export const AuthUserSchema = createSelectSchema(schema.authUsers);
export const SessionSchema = createSelectSchema(schema.sessions);
export const UserSchema = createSelectSchema(schema.users);
export const StoreSchema = createSelectSchema(schema.stores);
export const OrderSchema = createSelectSchema(schema.orders);
export const PaymentProfile = createSelectSchema(schema.paymentProfiles);
export const PriceSchema = createSelectSchema(schema.prices);
export const CartSchema = createSelectSchema(schema.carts);
export const LineItemSchema = createSelectSchema(schema.lineItems);
