import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";
import { Pool } from "@neondatabase/serverless";
export * as schema from "./schema";
export * from "./types";

export const client = new Pool();
export const db = drizzle(client, { schema });

export type Db = typeof db;
export type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
