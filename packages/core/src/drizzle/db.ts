import type { PgTransactionConfig } from "drizzle-orm/pg-core";
import { createContext } from "../context";
import * as schema from "./schema";
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";

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
] as const;

export const client = new Pool();
export const db = drizzle(client, { schema });

export type TableName = (typeof tableName)[number];
export type Db = typeof db;
export type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
type TxOrDb = Transaction | typeof db;

const TransactionContext = createContext<{
	tx: Transaction;
	effects: (() => void | Promise<void>)[];
}>();

export async function useTransaction<T>(callback: (trx: TxOrDb) => Promise<T>) {
	try {
		const { tx } = TransactionContext.use();
		return callback(tx);
	} catch {
		return callback(db);
	}
}

export async function afterTx(effect: () => any | Promise<any>) {
	try {
		const { effects } = TransactionContext.use();
		effects.push(effect);
	} catch {
		await effect();
	}
}

export async function createTransaction<T>(
	callback: (tx: Transaction) => Promise<T>,
	isolationLevel?: PgTransactionConfig["isolationLevel"],
): Promise<T> {
	try {
		const { tx } = TransactionContext.use();
		return callback(tx);
	} catch {
		const effects: (() => void | Promise<void>)[] = [];
		const result = await db.transaction(
			async (tx) => {
				return TransactionContext.with({ tx, effects }, () => callback(tx));
			},
			{
				isolationLevel: isolationLevel || "read committed",
			},
		);
		await Promise.all(effects.map((x) => x()));
		return result as T;
	}
}
