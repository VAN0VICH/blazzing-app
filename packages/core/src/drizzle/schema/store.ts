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
import { id } from "../types";
export const stores = pgTable(
	"stores",
	{
		...id,
		name: varchar("name").notNull(),
		logo: json("logo").$type<{
			id: string;
			url: string;
			alt: string;
		}>(),
		currencyCodes: json("currencies").$type<string[]>(),
		ownerID: varchar("owner_id")
			.references(() => users.id)
			.notNull(),
		avatar: varchar("avatar"),
		headerImage: varchar("header_image"),
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
