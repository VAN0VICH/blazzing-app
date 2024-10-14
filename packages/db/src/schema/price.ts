import { relations } from "drizzle-orm";
import { index, integer, pgTable, varchar } from "drizzle-orm/pg-core";

import { variants } from "./variant";

export const prices = pgTable(
	"prices",
	{
		id: varchar("id").notNull().primaryKey(),

		variantID: varchar("variant_id")
			.notNull()
			.references(() => variants.id, {
				onDelete: "cascade",
			}),
		amount: integer("amount").notNull(),
		currencyCode: varchar("currency_code").notNull(),
		version: integer("version"),
	},
	(price) => ({
		variantIDIndex: index("variant_id_index_1").on(price.variantID),
	}),
);
export const pricesRelations = relations(prices, ({ one }) => ({
	variant: one(variants, {
		fields: [prices.variantID],
		references: [variants.id],
	}),
}));
