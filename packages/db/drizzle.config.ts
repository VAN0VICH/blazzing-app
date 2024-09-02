///
import { defineConfig } from "drizzle-kit";
import { Resource } from "sst";

export default defineConfig({
	dialect: "postgresql",
	dbCredentials: {
		url: Resource.DATABASE_URL.value,
	},
	schema: "./schema",
	strict: true,
	verbose: true,
});
