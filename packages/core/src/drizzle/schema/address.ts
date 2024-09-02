import { relations } from "drizzle-orm";
import { index, integer, pgTable, text, varchar } from "drizzle-orm/pg-core";

import { users } from "./user";
import { id } from "../types";

export const addresses = pgTable(
	"addresses",
	{
		...id,
		type: text("type", { enum: ["shipping", "billing", "living"] }),
		line1: varchar("line_1"),
		line2: varchar("line_2"),
		city: varchar("city"),
		countryCode: varchar("country_code", { length: 2 }).notNull(),
		userID: varchar("user_id").references(() => users.id),
		postalCode: varchar("postal_code"),
		state: varchar("state"),
		cartID: varchar("cart_id"),
		version: integer("version").notNull().default(0),
		createdAt: varchar("created_at").notNull(),
	},
	(address) => ({
		userIDIndex: index("user_id_index").on(address.userID),
		cartIDIndex: index("cart_index_on_addr").on(address.cartID),
	}),
);
export const addressesRelations = relations(addresses, ({ one }) => ({
	user: one(users, {
		fields: [addresses.userID],
		references: [users.id],
	}),
	cart: one(addresses, {
		fields: [addresses.cartID],
		references: [addresses.id],
	}),
}));
