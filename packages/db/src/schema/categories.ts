import { index, integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const categories = pgTable(
	"categories",
	{
		id: varchar("id").notNull().primaryKey(),

		name: varchar("name").notNull(),
		parentID: varchar("parent_id"),
		version: integer("version"),
	},
	(categories) => ({
		parentID: index("parent_id_index").on(categories.parentID),
	}),
);
