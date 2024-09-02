import { integer, json, pgTable } from "drizzle-orm/pg-core";
import { id } from "../types";

export const jsonTable = pgTable("json", {
	...id,
	value: json("value")
		.notNull()
		.$type<Record<string, unknown> | string | number>(),
	version: integer("version").notNull(),
});
