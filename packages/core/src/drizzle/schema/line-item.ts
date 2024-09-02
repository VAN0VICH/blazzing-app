import { relations } from "drizzle-orm";
import { index, integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { id } from "../types";
import { carts } from "./cart";
import { orders } from "./order";
import { products } from "./product";
import { stores } from "./store";
import { variants } from "./variant";

export const lineItems = pgTable(
	"line_items",
	{
		...id,
		cartID: varchar("cart_id").references(() => carts.id),
		orderID: varchar("order_id").references(() => orders.id),
		title: varchar("title").notNull(),
		variantID: varchar("variant_id").notNull(),
		productID: varchar("product_id").notNull(),
		createdAt: varchar("created_at").notNull(),
		updatedAt: varchar("updated_at").$onUpdate(() => new Date().toISOString()),
		storeID: varchar("store_id").notNull(),
		quantity: integer("quantity").notNull().default(1),
		version: integer("version").notNull().default(0),
	},
	(lineItems) => ({
		variantIDIndex: index("variant_id_index_2").on(lineItems.variantID),
		productIDIndex: index("product_id_index_2").on(lineItems.productID),
		cartIDIndex: index("cart_id_index_1").on(lineItems.cartID),
		orderIDIndex: index("order_id_index").on(lineItems.orderID),
		storeIDIndex: index("store_id_index_1").on(lineItems.storeID),
	}),
);

export const lineItemsRelations = relations(lineItems, ({ one }) => ({
	cart: one(carts, {
		fields: [lineItems.cartID],
		references: [carts.id],
	}),
	variant: one(variants, {
		fields: [lineItems.variantID],
		references: [variants.id],
	}),
	product: one(products, {
		fields: [lineItems.productID],
		references: [products.id],
	}),
	order: one(orders, {
		fields: [lineItems.orderID],
		references: [orders.id],
	}),
	store: one(stores, {
		fields: [lineItems.storeID],
		references: [stores.id],
	}),
}));
