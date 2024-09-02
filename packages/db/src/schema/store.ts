import { relations } from "drizzle-orm";
import {
	index,
	integer,
	json,
	pgTable,
	text,
	varchar,
} from "drizzle-orm/pg-core";

import { orders } from "./order";
import { products } from "./product";
import { adminsToStores, users } from "./user";
import type { Image } from "../types";
export const stores = pgTable(
	"stores",
	{
		id: varchar("id").notNull().primaryKey(),

		name: varchar("name").notNull(),
		currencyCodes: json("currencies").$type<string[]>(),
		ownerID: varchar("owner_id")
			.references(() => users.id)
			.notNull(),
		image: json("image").$type<Image>(),
		headerImage: json("header_image").$type<Image>(),
		countryCode: varchar("country_code", { length: 2 }).notNull(),
		description: text("description"),
		createdAt: varchar("created_at").notNull(),
		updatedAt: varchar("updated_at").$onUpdate(() => new Date().toISOString()),
		version: integer("version").notNull(),
	},
	(t) => ({
		storeNameIndex: index("store_name_index").on(t.name),
		ownerIDIndex: index("owner_id_index").on(t.ownerID),
		countryCodeIndex: index("country_code_index").on(t.countryCode),
	}),
);
export const storesRelations = relations(stores, ({ one, many }) => ({
	owner: one(users, {
		fields: [stores.ownerID],
		references: [users.id],
		relationName: "owner.stores",
	}),
	admins: many(adminsToStores),
	products: many(products),
	orders: many(orders),
}));
