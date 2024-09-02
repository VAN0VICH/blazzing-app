import { integer, pgTable, uniqueIndex, varchar } from "drizzle-orm/pg-core";
import { id } from "../types";

const verifications = pgTable(
	"verifications",
	{
		...id,
		secret: varchar("secret").notNull(),
		target: varchar("target").notNull(),
		algorithm: varchar("algorithm").notNull(),
		digits: integer("digits").notNull(),
		//ttl
		period: integer("period").notNull(),
		createdAt: varchar("created_at").notNull(),
	},
	(verifications) => ({
		targetIndex: uniqueIndex("target_index").on(verifications.target),
	}),
);
export { verifications };
