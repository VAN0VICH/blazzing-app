import { index, integer, pgTable, text, varchar } from "drizzle-orm/pg-core";
import { id } from "../types";

const type = ["ORDER_PLACED", "USER_FOLLOWED", "DIRECT_MESSAGE"] as const;

export const notifications = pgTable(
	"notifications",
	{
		...id,
		entityID: varchar("entity_id").notNull(),
		type: text("type", { enum: type }),
		title: varchar("title").notNull(),
		description: text("description").notNull(),
		createdAt: varchar("created_at").notNull(),
		version: integer("version").notNull().default(0),
	},
	(notifications) => ({
		entityID: index("entity_id_idx_1").on(notifications.entityID),
	}),
);
