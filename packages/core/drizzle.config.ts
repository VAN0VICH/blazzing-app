import type { Config } from "drizzle-kit";

if (!process.env.POSTGRES_URL) {
  throw new Error("Missing POSTGRES_URL");
}


export default {
  schema: "./src/**/*.sql.ts",
  dialect: "postgresql",
  dbCredentials: {
		url: process.env.DATABASE_URL,
	},
  verbose:true,
} satisfies Config;
