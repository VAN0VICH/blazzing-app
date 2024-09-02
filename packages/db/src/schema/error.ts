import { relations } from "drizzle-orm";
import {
	integer,
	pgTable,
	text,
	uniqueIndex,
	varchar,
} from "drizzle-orm/pg-core";

import { users } from "./user";

export const clientErrors = pgTable(
	"client_errors",
	{
		id: varchar("id").notNull().primaryKey(),

		title: text("title").notNull(),
		message: text("message").notNull(),
		userID: varchar("auth_id").notNull(),
		createdAt: varchar("created_at").notNull(),
		version: integer("version").notNull(),
	},
	(users) => ({
		userIDIndex: uniqueIndex("auth_id_index2").on(users.userID),
	}),
);
export const errorRelations = relations(clientErrors, ({ one }) => ({
	user: one(users, {
		fields: [clientErrors.userID],
		references: [users.id],
	}),
}));
