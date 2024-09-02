import { relations } from "drizzle-orm";
import {
	index,
	integer,
	pgTable,
	text,
	uniqueIndex,
	varchar,
} from "drizzle-orm/pg-core";

import { products } from "./product";
import { stores } from "./store";
import { id } from "../types";

const sortOrder = [
	"alphaAsc",
	"alphaDesc",
	"bestSelling",
	"created",
	"createdDesc",
	"manual",
	"priceAsc",
	"priceDesc",
] as const;

export const collections = pgTable(
	"collections",
	{
		...id,

		handle: varchar("handle"),
		title: varchar("title"),
		sortOrder: text("sort_order", { enum: sortOrder }),
		storeID: varchar("store_id").notNull(),
		createdAt: varchar("created_at"),
		updatedAt: varchar("updated_at").$onUpdate(() => new Date().toISOString()),
		version: integer("version").notNull().default(0),
	},
	(productCollection) => ({
		handleIndex: uniqueIndex("handle_index").on(productCollection.handle),
		storeIDIndex: index("store_id_index").on(productCollection.storeID),
	}),
);
export const collectionRelations = relations(collections, ({ many, one }) => ({
	products: many(products),
	store: one(stores, {
		fields: [collections.storeID],
		references: [stores.id],
	}),
}));
