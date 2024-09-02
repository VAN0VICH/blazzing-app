import { relations } from "drizzle-orm";
import { integer, pgTable, uniqueIndex, varchar } from "drizzle-orm/pg-core";

import { productsToTags } from "./product";
import { id } from "../types";

export const tags = pgTable(
	"tags",
	{
		...id,

		value: varchar("value").notNull(),
		createdAt: varchar("created_at").notNull(),
		version: integer("version").notNull().default(0),
	},
	(productTags) => ({
		valueIndex: uniqueIndex("value_index").on(productTags.value),
	}),
);
export const productTagsRelations = relations(tags, ({ many }) => ({
	products: many(productsToTags),
}));
