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
		displayId: varchar("display_id"),
		paymentStatus: text("payment_status", {
			enum: ["paid", "refunded", "not_paid", "partially_refunded"],
		}).default("paid"),
		status: text("status", {
			enum: ["pending", "processing", "completed", "cancelled"],
		})

			.notNull()
			.default("pending"),
		type: text("type", { enum: ["delivery", "onsite", "takeout"] }).notNull(),
		tableNumber: integer("tableNumber"),
		shippingStatus: text("shipping_status", {
			enum: ["pending", "shipped", "delivered", "cancelled"],
		}).default("pending"),

		countryCode: varchar("country_code", { length: 2 }).notNull(),
		currencyCode: varchar("currency_code", { length: 3 })

			.notNull()
			.default("BYN"),
		customerID: varchar("customer_id").references(() => customers.id),
		subtotal: integer("subtotal").notNull(),
		shippingTotal: integer("shippingTotal"),
		total: integer("total").notNull(),
		shippingAddressID: varchar("shipping_address_id").references(
			() => addresses.id,
		),
		billingAddressID: varchar("billing_address_id").references(
			() => addresses.id,
		),
		fullName: varchar("full_name"),
		email: varchar("email"),
		phone: varchar("phone"),
		tempUserID: varchar("temp_user_id"),
		storeID: varchar("store_id")
			.notNull()
			.references(() => stores.id),
		createdAt: varchar("created_at").notNull(),
		updatedAt: varchar("updated_at").$onUpdate(() => new Date().toISOString()),
		version: integer("version").notNull().default(0),
	},
	(orders) => ({
		displayId: index("display_id_index").on(orders.displayId),
		userIDIndex: index("customer_id_index").on(orders.customerID),
		shippingAddressIndex: index("shipping_address_id_1").on(
			orders.shippingAddressID,
		),
		email: index("email_index_2").on(orders.email),
		billingAddressIndex: index("billing_address_id_1").on(
			orders.billingAddressID,
		),
		storeIDIndex: index("store_id_index_3").on(orders.storeID),
		tempUserIDIndex: index("temp_user_id_index").on(orders.tempUserID),
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
