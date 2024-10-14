import {
	ProductSchema,
	type WorkerBindings,
	type WorkerEnv,
} from "@blazzing-app/validators";
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { getDB } from "../lib/db";

export namespace ProductApi {
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
								result: z.nullable(ProductSchema),
							}),
						},
					},
					description: "Returns product by handle.",
				},
			},
		}),
		//@ts-ignore
		async (c) => {
			const { handle } = c.req.valid("query");
			const db = getDB({ connectionString: c.env.DATABASE_URL });

			const variant = await db.query.variants.findFirst({
				where: (variants, { eq }) => eq(variants.handle, handle),
				with: {
					prices: true,
					optionValues: {
						with: {
							optionValue: true,
						},
					},
				},
			});
			if (!variant) {
				return null;
			}
			const product = await db.query.products.findFirst({
				where: (products, { eq }) => eq(products.id, variant.productID),
				with: {
					options: {
						with: {
							optionValues: true,
						},
					},
					store: true,
				},
			});

			return c.json({
				result: {
					...product,
					baseVariant: variant,
				},
			});
		},
	);
}
