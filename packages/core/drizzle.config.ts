import type { Config } from "drizzle-kit";
import { Resource } from "sst";

export default {
	schema: "./src/**/*.sql.ts",
	dialect: "postgresql",
	dbCredentials: {
		url: Resource,
	},
	verbose: true,
} satisfies Config;
