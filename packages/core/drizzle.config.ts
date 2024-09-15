import { Resource } from "sst";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
	dialect: "postgresql",
	dbCredentials: {
		url: Resource.DATABASE_URL.value,
	},
	schema: "./schema",
	verbose: true,
});
