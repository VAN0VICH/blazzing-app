import { char } from "drizzle-orm/pg-core";

export const ulid = (name: string) => char(name, { length: 26 + 4 });

export const id = {
	get id() {
		return ulid("id").primaryKey();
	},
};
