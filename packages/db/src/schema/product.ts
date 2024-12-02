import { relations } from "drizzle-orm";
import {
	boolean,
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

export const productStatus = ["draft", "published", "archived"] as const;
export const productType = ["digital", "physical", "giftcard"] as const;
// const weightUnits = ["kg", "g", "lb", "oz"] as const;

export const products = pgTable(
	"products",
	{
		id: varchar("id").notNull().primaryKey(),
		baseVariantID: varchar("base_variant_id").notNull(),
		available: boolean("available").default(true),
		metadata: json("metadata").$type<Record<string, string>>(),

		collectionID: varchar("collection_id").references(() => collections.id),
		collectionHandle: varchar("collection_handle"),
		score: integer("score").default(0),
		status: text("status", {
			enum: productStatus,
		})
			.notNull()
			.default("draft"),
		type: text("type", {
			enum: productType,
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
		baseVariantIDIndex: index("base_variant_id_index").on(
			product.baseVariantID,
		),
		collectionHandleIndex: index("collection_handle_index").on(
			product.collectionHandle,
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
