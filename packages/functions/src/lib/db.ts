import { schema } from "@blazzing-app/db";
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
const getDB = ({ connectionString }: { connectionString: string }) => {
	const client = new Pool({ connectionString });
	const db = drizzle(client, { schema });
	return db;
};
export { getDB };
