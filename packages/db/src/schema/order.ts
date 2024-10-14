import { index, integer, pgTable, text, varchar } from "drizzle-orm/pg-core";

import { relations } from "drizzle-orm";
import { addresses } from "./address";
import { customers } from "./customer";
import { lineItems } from "./line-item";
import { stores } from "./store";

export const orders = pgTable(
	"orders",
	{
		id: varchar("id").notNull().primaryKey(),
		paymentStatus: text("payment_status", {
			enum: ["paid", "refunded"],
		}).default("paid"),
		status: text("status", {
			enum: ["pending", "completed", "cancelled"],
		})
			.notNull()
			.default("pending"),
		shippingStatus: text("shipping_status", {
			enum: ["pending", "shipped", "delivered", "cancelled"],
		}).default("pending"),

		countryCode: varchar("country_code", { length: 2 }).notNull(),
		currencyCode: varchar("currency_code", { length: 3 })

			.notNull()
			.default("USD"),
		customerID: varchar("customer_id")
			.notNull()
			.references(() => customers.id),
		subtotal: integer("subtotal"),
		total: integer("total"),
		shippingAddressID: varchar("shipping_address_id").references(
			() => addresses.id,
		),
		billingAddressID: varchar("billing_address_id").references(
			() => addresses.id,
		),
		fullName: varchar("full_name"),
		email: varchar("email"),
		phone: varchar("phone"),
		storeID: varchar("store_id")
			.notNull()
			.references(() => stores.id),
		createdAt: varchar("created_at").notNull(),
		updatedAt: varchar("updated_at").$onUpdate(() => new Date().toISOString()),
		version: integer("version").notNull().default(0),
	},
	(orders) => ({
		userIDIndex: index("customer_id_index").on(orders.customerID),
		shippingAddressIndex: index("shipping_address_id_1").on(
			orders.shippingAddressID,
		),
		email: index("email_index_2").on(orders.email),
		billingAddressIndex: index("billing_address_id_1").on(
			orders.billingAddressID,
		),
		storeIDIndex: index("store_id_index_3").on(orders.storeID),
	}),
);
export const ordersRelations = relations(orders, ({ one, many }) => ({
	customer: one(customers, {
		fields: [orders.customerID],
		references: [customers.id],
	}),
	items: many(lineItems),
	shippingAddress: one(addresses, {
		fields: [orders.shippingAddressID],
		references: [addresses.id],
	}),
	billingAddress: one(addresses, {
		fields: [orders.billingAddressID],
		references: [addresses.id],
	}),
	store: one(stores, {
		fields: [orders.storeID],
		references: [stores.id],
	}),
}));
