import { relations } from "drizzle-orm";
import { pgTable, varchar } from "drizzle-orm/pg-core";
import { authUsers } from "./auth";

const sessions = pgTable("sessions", {
	id: varchar("id").primaryKey(),
	authID: varchar("auth_id")
		.notNull()
		.references(() => authUsers.id),

	expiresAt: varchar("expiresAt").notNull(),
	createdAt: varchar("created_at").notNull(),
});
export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(authUsers, {
		fields: [sessions.authID],
		references: [authUsers.id],
	}),
}));
export { sessions };
