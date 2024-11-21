import { pgTable, varchar } from "drizzle-orm/pg-core";

export const apiKeyTable = pgTable("api-key", {
	id: varchar("id").notNull().primaryKey(),
	value: varchar("value").notNull(),
});
