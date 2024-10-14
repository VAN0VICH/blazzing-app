import { schema } from "@blazzing-app/db";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
const getDB = ({ connectionString }: { connectionString: string }) => {
	const client = new Pool({ connectionString });
	const db = drizzle(client, { schema });
	return db;
};
export { getDB };
