import { relations } from "drizzle-orm";
import { bigint, index, integer, pgTable, varchar } from "drizzle-orm/pg-core";

import { variants } from "./variant";
import { id } from "../types";

export const prices = pgTable(
	"prices",
	{
		...id,
		variantID: varchar("variant_id")
			.notNull()
			.references(() => variants.id, {
				onDelete: "cascade",
			}),
		amount: bigint("amount", { mode: "number" }).notNull(),
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
