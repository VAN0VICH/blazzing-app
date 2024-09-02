import { index, integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { id } from "../types";

export const categories = pgTable(
	"categories",
	{
		...id,
		name: varchar("name").notNull(),
		parentID: varchar("parent_id"),
		version: integer("version"),
	},
	(categories) => ({
		parentID: index("parent_id_index").on(categories.parentID),
	}),
);
