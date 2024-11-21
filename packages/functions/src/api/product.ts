import type { WorkerBindings, WorkerEnv } from "@blazzing-app/validators";
import {
	PriceSchema,
	ProductSchema,
	VariantSchema,
} from "@blazzing-app/validators/server";
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { getDB } from "../lib/db";

const FullProductSchema = ProductSchema.extend({
	baseVariant: VariantSchema.extend({
		optionValues: z.array(
			z.object({
				optionValue: z.object({
					value: z.string(),
				}),
			}),
		),
		prices: z.array(PriceSchema),
	}),
	variants: z.array(
		VariantSchema.extend({
			optionValues: z.array(
				z.object({
					optionValue: z.object({
						value: z.string(),
					}),
				}),
			),
			prices: z.array(PriceSchema),
		}),
	),
});
export namespace ProductApi {
	export const route = new OpenAPIHono<{
		Bindings: WorkerBindings & WorkerEnv;
	}>()
		.openapi(
			createRoute({
				security: [{ Bearer: [] }],
				method: "get",
				path: "/handle",
				request: {
					query: z.object({
						handle: z.string().or(z.array(z.string())),
					}),
				},
				responses: {
					200: {
						content: {
							"application/json": {
								schema: z.object({
									result: z.array(FullProductSchema),
								}),
							},
						},
						description: "Returns product by handle.",
					},
				},
			}),
			async (c) => {
				const { handle } = c.req.valid("query");
				const cached = await c.env.KV.get(`product_${JSON.stringify(handle)}`);
				if (cached) {
					return c.json({
						result: JSON.parse(cached),
					});
				}
				const db = getDB({ connectionString: c.env.DATABASE_URL });

				const variants = await db.query.variants.findMany({
					where: (variants, { inArray }) =>
						inArray(
							variants.handle,
							typeof handle === "string" ? [handle] : handle,
						),
					with: {
						product: {
							with: {
								options: {
									with: {
										optionValues: true,
									},
								},
								store: true,
								variants: {
									with: {
										prices: true,
										optionValues: {
											with: {
												optionValue: true,
											},
										},
									},
								},
							},
						},
						prices: true,
						optionValues: {
							with: {
								optionValue: true,
							},
						},
					},
				});
				const result = variants
					.map((variant) => {
						if (variant.product.status !== "published") return undefined;
						return {
							...variant.product,
							baseVariant: variant,
							variants: variant.product.variants,
						};
					})
					.filter(Boolean);
				await c.env.KV.put(
					`product_${JSON.stringify(handle)}`,
					JSON.stringify(result),
				);

				return c.json({
					result,
				});
			},
		)
		.openapi(
			createRoute({
				security: [{ Bearer: [] }],
				method: "get",
				path: "/list",
				responses: {
					200: {
						content: {
							"application/json": {
								schema: z.object({
									result: z.array(
										ProductSchema.extend({
											baseVariant: VariantSchema.extend({
												prices: z.array(PriceSchema),
											}),
										}),
									),
								}),
							},
						},
						description: "Returns products.",
					},
				},
			}),
			async (c) => {
				const cached = await c.env.KV.get("product_list");
				if (cached) {
					return c.json({
						result: JSON.parse(cached),
					});
				}
				const db = getDB({ connectionString: c.env.DATABASE_URL });

				const products = await db.query.products.findMany({
					where: (products, { eq }) => eq(products.status, "published"),
					with: {
						options: {
							with: {
								optionValues: true,
							},
						},
						baseVariant: {
							with: {
								prices: true,
								optionValues: {
									with: {
										optionValue: true,
									},
								},
							},
						},
					},
				});

				await c.env.KV.put("product_list", JSON.stringify(products));

				return c.json({
					result: products,
				});
			},
		)
		.openapi(
			createRoute({
				security: [{ Bearer: [] }],
				method: "get",
				path: "/collection-handle",
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
									result: z.array(
										ProductSchema.extend({
											baseVariant: VariantSchema.extend({
												prices: z.array(PriceSchema),
											}),
										}),
									),
								}),
							},
						},
						description: "Returns products by collection handle.",
					},
				},
			}),
			async (c) => {
				const { handle } = c.req.valid("query");
				const cached = await c.env.KV.get(`collection_${handle}`);
				if (cached) {
					return c.json({
						result: JSON.parse(cached),
					});
				}
				const db = getDB({ connectionString: c.env.DATABASE_URL });

				const products = await db.query.products.findMany({
					where: (products, { eq }) => eq(products.collectionHandle, handle),
					with: {
						baseVariant: {
							with: {
								prices: true,
							},
						},
					},
				});

				await c.env.KV.put(`collection_${handle}`, JSON.stringify(products));
				return c.json({
					result: products,
				});
			},
		);
}
