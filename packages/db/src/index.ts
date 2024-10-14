import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";
import { Pool } from "@neondatabase/serverless";
export * as schema from "./schema";
export * from "./table-name";
export * from "./types";

/*TEMP*/
const tableName = [
	"users",
	"products",
	"variants",
	"productOptions",
	"productOptionValues",
	"tags",
	"collections",
	"productsToTags",
	"prices",
	"stores",
	"productOptionValuesToVariants",
	"json",
	"carts",
	"lineItems",
	"addresses",
	"orders",
	"notifications",
	"customers",
	"paymentProfiles",
	"stripe",
	"auth",
] as const;

/*TEMP*/
export type TableName = (typeof tableName)[number];

export const client = new Pool();
export const db = drizzle(client, { schema });

export type Db = typeof db;
export type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
