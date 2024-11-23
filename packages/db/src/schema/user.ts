import { relations } from "drizzle-orm";
import {
	integer,
	json,
	pgTable,
	primaryKey,
	text,
	uniqueIndex,
	varchar,
} from "drizzle-orm/pg-core";

import { addresses } from "./address";
import { stores } from "./store";
import { authUsers } from "./auth";
import type { Image } from "../types";

export const users = pgTable(
	"users",
	{
		id: varchar("id").notNull().primaryKey(),
		authID: varchar("auth_id").references(() => authUsers.id),
		email: varchar("email"),
		phone: varchar("phone"),
		username: varchar("username"),
		fullName: varchar("full_name"),
		avatar: json("avatar").$type<Image | string>(),
		description: text("description"),
		role: text("role", { enum: ["moderator", "user"] })
			.notNull()
			.default("user"),
		metadata: json("metadata").$type<Record<string, string>>(),
		createdAt: varchar("created_at").notNull(),
		updatedAt: varchar("updated_at").$onUpdate(() => new Date().toISOString()),
		version: integer("version").notNull(),
	},
	(users) => ({
		emailIndex: uniqueIndex("email_index1").on(users.email),
		fullNameIndex: uniqueIndex("full_name_index1").on(users.fullName),
		phoneIndex: uniqueIndex("phone_index").on(users.phone),
		usernameIndex: uniqueIndex("username_index1").on(users.username),
		authIDIndex: uniqueIndex("auth_id_index").on(users.authID),
	}),
);
export const userRelations = relations(users, ({ many, one }) => ({
	stores: many(stores, { relationName: "owner.stores" }),
	addresses: many(addresses),
	authUser: one(authUsers, {
		fields: [users.authID],
		references: [authUsers.id],
		relationName: "auth.user",
	}),
}));
export const adminsToStores = pgTable(
	"admins_to_stores",
	{
		userID: varchar("user_id")
			.notNull()
			.references(() => users.id),
		storeID: varchar("store_id")
			.notNull()
			.references(() => stores.id),
	},
	(adminsToStores) => ({
		pk: primaryKey({
			columns: [adminsToStores.userID, adminsToStores.storeID],
		}),
	}),
);
export const adminsToStoresRelations = relations(adminsToStores, ({ one }) => ({
	admin: one(users, {
		fields: [adminsToStores.userID],
		references: [users.id],
	}),
	store: one(stores, {
		fields: [adminsToStores.storeID],
		references: [stores.id],
	}),
}));
