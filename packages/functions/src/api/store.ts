import type { Db } from "@blazzing-app/db";
import type { WorkerBindings, WorkerEnv } from "@blazzing-app/validators";
import { StoreSchema } from "@blazzing-app/validators";
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
export namespace StoreApi {
	//@ts-ignore
	export const route = new OpenAPIHono<{
		Bindings: WorkerBindings & WorkerEnv;
	}>().openapi(
		createRoute({
			security: [{ Bearer: [] }],
			method: "get",
			path: "/name",
			request: {
				query: z.object({
					name: z.string(),
				}),
			},
			responses: {
				200: {
					content: {
						"application/json": {
							schema: z.object({
								result: z.nullable(StoreSchema),
							}),
						},
					},
					description: "Returns store by name.",
				},
			},
		}),
		//@ts-ignore
		async (c) => {
			const { name } = c.req.valid("query");
			const cached = await c.env.KV.get(`store_${JSON.stringify(name)}`);
			if (cached) {
				return c.json({
					result: JSON.parse(cached),
				});
			}
			const db = c.get("db" as never) as Db;

			const store = await db.query.stores.findFirst({
				where: (stores, { eq }) => eq(stores.name, name),
				with: {
					orders: true,
					owner: true,
					products: true,
				},
			});
			await c.env.KV.put(
				`store_${JSON.stringify(name)}`,
				JSON.stringify(store),
			);
			return c.json({ result: store ?? null });
		},
	);
}
