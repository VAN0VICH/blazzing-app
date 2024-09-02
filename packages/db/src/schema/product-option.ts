import { relations } from "drizzle-orm";
import { index, integer, pgTable, varchar } from "drizzle-orm/pg-core";

import { products } from "./product";
import { productOptionValues } from "./product-option-value";

export const productOptions = pgTable(
	"product_options",
	{
		id: varchar("id").notNull().primaryKey(),

		productID: varchar("product_id")
			.references(() => products.id, {
				onDelete: "cascade",
			})
			.notNull(),
		name: varchar("name"),
		version: integer("version").notNull().default(0),
	},
	(productOption) => ({
		productIDIndex: index("product_id_index2").on(productOption.productID),
	}),
);
export const optionRelations = relations(productOptions, ({ one, many }) => ({
	product: one(products, {
		fields: [productOptions.productID],
		references: [products.id],
	}),
	optionValues: many(productOptionValues),
}));
