import { relations } from "drizzle-orm";
import {
	index,
	integer,
	json,
	pgTable,
	primaryKey,
	text,
	varchar,
} from "drizzle-orm/pg-core";

import { collections } from "./collection";
import { productOptions } from "./product-option";
import { stores } from "./store";
import { tags } from "./tag";
import { variants } from "./variant";
import { id } from "../types";

export const productStatus = ["draft", "published", "archived"] as const;
export const type = ["digital", "physical", "giftcard"] as const;
// const weightUnits = ["kg", "g", "lb", "oz"] as const;

export const products = pgTable(
	"products",
	{
		...id,
		baseVariantID: varchar("default_variant_id").notNull(),
		metadata: json("metadata").$type<Record<string, string>>(),
		collectionID: varchar("collection_pk").references(() => collections.id),
		score: integer("score").default(0),
		status: text("status", {
			enum: productStatus,
		})
			.notNull()
			.default("draft"),
		type: text("type", {
			enum: type,
		})
			.notNull()
			.default("physical"),
		updatedBy: varchar("updated_by"),
		storeID: varchar("store_id")
			.notNull()
			.references(() => stores.id, { onDelete: "cascade" }),
		createdAt: varchar("created_at").notNull(),
		updatedAt: varchar("updated_at").$onUpdate(() => new Date().toISOString()),
		version: integer("version").notNull(),
	},
	(product) => ({
		collectionIDIndex: index("collection_id_index1").on(product.collectionID),
		statusIndex: index("status_index1").on(product.status),
		storeIDIndex: index("store_id_index1").on(product.storeID),
		scoreIndex: index("score_index").on(product.score),
		defaultVariantIDIndex: index("default_variant_id_index").on(
			product.baseVariantID,
		),
	}),
);
export const productsRelations = relations(products, ({ one, many }) => ({
	collection: one(collections, {
		fields: [products.collectionID],
		references: [collections.id],
	}),
	variants: many(variants),
	options: many(productOptions),
	tags: many(productsToTags),
	store: one(stores, {
		fields: [products.storeID],
		references: [stores.id],
	}),
	baseVariant: one(variants, {
		fields: [products.baseVariantID],
		references: [variants.id],
	}),
}));
export const productsToTags = pgTable(
	"products_to_tags",
	{
		id: varchar("id"),

		productID: varchar("product_id")
			.notNull()
			.references(() => products.id, { onDelete: "cascade" }),
		tagID: varchar("tag_id")
			.notNull()
			.references(() => tags.id, { onDelete: "cascade" }),
		version: integer("version"),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.productID, t.tagID] }),
	}),
);
export const productToTagsRelations = relations(productsToTags, ({ one }) => ({
	product: one(products, {
		fields: [productsToTags.productID],
		references: [products.id],
	}),
	tag: one(tags, {
		fields: [productsToTags.tagID],
		references: [tags.id],
	}),
}));
