import { integer, pgTable, uniqueIndex, varchar } from "drizzle-orm/pg-core";

import { users } from "./user";
import { relations } from "drizzle-orm";

export const customers = pgTable(
	"customers",
	{
		id: varchar("id").notNull().primaryKey(),
		userID: varchar("user_id").references(() => users.id),
		email: varchar("email").notNull(),
		createdAt: varchar("created_at").notNull(),
		updatedAt: varchar("updated_at").$onUpdate(() => new Date().toISOString()),
		version: integer("version").notNull(),
	},
	(customers) => ({
		emailIndex: uniqueIndex("email_index2").on(customers.email),
		userIDIndex: uniqueIndex("user_id_index1").on(customers.userID),
	}),
);

export const customerRelations = relations(customers, ({ one }) => ({
	user: one(users, {
		fields: [customers.userID],
		references: [users.id],
		relationName: "user.customer",
	}),
}));
