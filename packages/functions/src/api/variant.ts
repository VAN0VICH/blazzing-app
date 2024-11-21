import type { WorkerBindings, WorkerEnv } from "@blazzing-app/validators";
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { getDB } from "../lib/db";
import { VariantSchema } from "@blazzing-app/validators/server";

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
					handle: z.string(),
				}),
			},
			responses: {
				200: {
					content: {
						"application/json": {
							schema: z.object({
								result: z.nullable(VariantSchema),
							}),
						},
					},
					description: "Returns variant by handle.",
				},
			},
		}),
		async (c) => {
			const { handle } = c.req.valid("query");
			const db = getDB({ connectionString: c.env.DATABASE_URL });

			const variant = await db.query.variants.findFirst({
				where: (variants, { eq }) => eq(variants.handle, handle),
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
			});
			if (!variant) {
				return c.json({ result: null });
			}

			return c.json({
				result: variant,
			});
		},
	);
}
