import type { WorkerBindings, WorkerEnv } from "@blazzing-app/validators";
import type { Context } from "hono";
import { getDB } from "../lib/db";

// Define a logging middleware
const withKey = async (
	c: Context<{ Bindings: WorkerBindings & WorkerEnv }>,
	next: () => Promise<Response>, // Ensure `next` returns a Response
): Promise<Response> => {
	// Make sure to return a Response here
	// Extract the API key from the Authorization header
	const key = c.req.raw.headers.get("x-publishable-key");
	const db = getDB({ connectionString: c.env.DATABASE_URL });
	console.log("key<----", key);

	// If the key is missing, return an Unauthorized response
	if (!key) {
		return c.text("Unauthorized: the api key is needed.", 401);
	}

	// Check the cache for the key
	const cached = await c.env.KV.get(key);
	if (cached) {
		c.set("db" as never, db); // Set the db in context
		c.set("storeID" as never, cached);
		return await next(); // Proceed to the next middleware/route
	}

	// Query the database if the key is not found in cache
	try {
		const result = await db.query.apiKeyTable.findFirst({
			where: (keys, { eq }) => eq(keys.id, key),
		});

		// If the key is invalid or not found in the database, return Unauthorized
		if (!result) {
			return c.text("Unauthorized: the api key is needed.", 401);
		}

		// Cache the key for future use (optional, depending on your logic)
		await c.env.KV.put(key, result.value); // You can store the result or just the key for efficiency
		c.set("storeID" as never, result.value);

		// Set the db in context and proceed
		c.set("db" as never, db);
		return await next();
	} catch (error) {
		console.error("Database error:", error);
		return c.text("Internal Server Error", 500); // Handle unexpected errors
	}
};

export { withKey };
