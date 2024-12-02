import type { WorkerBindings, WorkerEnv } from "@blazzing-app/validators";
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { VariantSchema } from "@blazzing-app/validators";
import type { Db } from "@blazzing-app/db";

export namespace VariantApi {
	export const route = new OpenAPIHono<{
		Bindings: WorkerBindings & WorkerEnv;
	}>().openapi(
		createRoute({
			security: [{ Bearer: [] }],
			method: "get",
			path: "/handle",
			request: {
				query: z.object({
					handle: z.string().or(z.array(z.string())),
					storeID: z.string(),
				}),
			},
			responses: {
				200: {
					content: {
						"application/json": {
							schema: z.object({
								result: z.array(VariantSchema),
							}),
						},
					},
					description: "Returns variant by handle.",
				},
			},
		}),
		async (c) => {
			const { handle, storeID } = c.req.valid("query");
			const db = c.get("db" as never) as Db;
			const cached = await c.env.KV.get(`variant_${JSON.stringify(handle)}`);
			if (cached) {
				console.log(`Cache hit for variant handle: ${handle}!`);
				return c.json({
					result: JSON.parse(cached),
				});
			}

			const variants = (
				await db.query.variants.findMany({
					where: (variants, { inArray }) =>
						inArray(
							variants.handle,
							typeof handle === "string" ? [handle] : handle,
						),
					with: {
						optionValues: {
							with: {
								optionValue: {
									with: {
										option: true,
									},
								},
							},
						},

						product: {
							with: {
								options: {
									with: {
										optionValues: true,
									},
								},
								store: true,
							},
						},
						prices: true,
					},
				})
			).filter((v) => v.product.storeID === storeID);
			await c.env.KV.put(
				`variant_${JSON.stringify(handle)}`,
				JSON.stringify(variants),
			);

			return c.json({
				result: variants,
			});
		},
	);
}
