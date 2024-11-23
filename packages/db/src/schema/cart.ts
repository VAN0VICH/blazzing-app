import { index, integer, pgTable, varchar } from "drizzle-orm/pg-core";

import { relations } from "drizzle-orm";
import { addresses } from "./address";
import { lineItems } from "./line-item";
import { users } from "./user";

export const carts = pgTable(
	"carts",
	{
		id: varchar("id").notNull().primaryKey(),

		countryCode: varchar("country_code", { length: 2 }).notNull(),
		currencyCode: varchar("currency_code", { length: 3 }).notNull(),
		userID: varchar("user_id").references(() => users.id),
		shippingAddressID: varchar("shipping_address_id").references(
			() => addresses.id,
		),
		billingAddressID: varchar("billing_address_id").references(
			() => addresses.id,
		),
		fullName: varchar("full_name"),
		email: varchar("email"),
		phone: varchar("phone"),
		createdAt: varchar("created_at").notNull(),
		updatedAt: varchar("updated_at").$onUpdate(() => new Date().toISOString()),
		version: integer("version").notNull().default(0),
	},
	(carts) => ({
		userIDIndex: index("user_id_index_1").on(carts.userID),
		shippingAddressIndex: index("shipping_address_id").on(
			carts.shippingAddressID,
		),
		email: index("email_index_1").on(carts.email),
		billingAddressIndex: index("billing_address_id").on(carts.billingAddressID),
	}),
);
export const cartsRelations = relations(carts, ({ one, many }) => ({
	user: one(users, {
		fields: [carts.userID],
		references: [users.id],
	}),
	items: many(lineItems),
	shippingAddress: one(addresses, {
		fields: [carts.shippingAddressID],
		references: [addresses.id],
	}),
	billingAddress: one(addresses, {
		fields: [carts.billingAddressID],
		references: [addresses.id],
	}),
}));
