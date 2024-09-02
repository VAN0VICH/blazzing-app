import { relations } from "drizzle-orm";
import {
	index,
	integer,
	pgTable,
	uniqueIndex,
	varchar,
} from "drizzle-orm/pg-core";

import { users } from "./user";
import { id } from "../types";

export const authUsers = pgTable(
	"auth_users",
	{
		...id,
		username: varchar("username"),
		avatar: varchar("avatar"),
		googleID: varchar("google_id"),
		fullName: varchar("full_name"),
		userID: varchar("user_id"),
		email: varchar("email").notNull(),
		phone: varchar("phone"),
		createdAt: varchar("created_at").notNull(),
		updatedAt: varchar("updated_at").$onUpdate(() => new Date().toISOString()),
		version: integer("version").notNull(),
	},
	(users) => ({
		username: index("username_index").on(users.username),
		emailIndex: uniqueIndex("email_index").on(users.email),
		googleIDIndex: uniqueIndex("google_id_index1").on(users.googleID),
		fullNameIndex: index("full_name_index").on(users.fullName),
		userIDIndex: uniqueIndex("user_id_index5").on(users.userID),
		phoneIndex: uniqueIndex("phone_index1").on(users.phone),
	}),
);
export const authUserRelations = relations(authUsers, ({ one }) => ({
	user: one(users, {
		fields: [authUsers.userID],
		references: [users.id],
		relationName: "auth.user",
	}),
}));
