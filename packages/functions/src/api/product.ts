import type { Db } from "@blazzing-app/db";
import type {
	StoreProduct,
	WorkerBindings,
	WorkerEnv,
} from "@blazzing-app/validators";
import {
	PriceSchema,
	ProductSchema,
	VariantSchema,
} from "@blazzing-app/validators";
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";

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
				path: "/id",
				request: {
					query: z.object({
						id: z.string().or(z.array(z.string())),
						storeID: z.string(),
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
				const { id, storeID } = c.req.valid("query");
				const cached = await c.env.KV.get(
					`product_${JSON.stringify(id)}_${storeID}`,
				);
				if (cached) {
					console.log(`Cache hit for product with id:${id}!`);
					return c.json({
						result: JSON.parse(cached),
					});
				}
				const db = c.get("db" as never) as Db;

				const products = await db.query.products.findMany({
					where: (products, { inArray, and, eq }) =>
						and(
							inArray(products.id, typeof id === "string" ? [id] : id),
							eq(products.status, "published"),
							eq(products.storeID, storeID),
						),
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
								product: true,
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
								product: true,
							},
						},
					},
				});
				await c.env.KV.put(
					`product_${JSON.stringify(id)}`,
					JSON.stringify(products),
				);

				return c.json({
					result: products,
				});
			},
		)
		.openapi(
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
									result: z.array(FullProductSchema),
								}),
							},
						},
						description: "Returns product by handle.",
					},
				},
			}),
			async (c) => {
				const { handle, storeID } = c.req.valid("query");
				const cached = await c.env.KV.get(
					`product_${JSON.stringify(handle)}_${storeID}`,
				);
				if (cached) {
					console.log(`Cache hit for product with handle:${handle}!`);
					return c.json({
						result: JSON.parse(cached),
					});
				}
				const db = c.get("db" as never) as Db;

				const variants = await db.query.variants.findMany({
					where: (variants, { inArray }) =>
						inArray(
							variants.handle,
							typeof handle === "string" ? [handle] : handle,
						),
					with: {
						product: {
							with: {
								baseVariant: {
									with: {
										prices: true,
										optionValues: {
											with: {
												optionValue: true,
											},
										},
										product: true,
									},
								},
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
										product: true,
									},
								},
							},
						},
					},
				});
				//@ts-ignore
				const result = variants
					.map((variant) => {
						if (
							variant.product.status !== "published" ||
							variant.product.storeID !== storeID
						)
							return undefined;
						return variant.product;
					})
					.filter(Boolean) as StoreProduct[];
				await c.env.KV.put(
					`product_${JSON.stringify(handle)}_${storeID}`,
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
				request: {
					query: z.object({
						storeID: z.string(),
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
						description: "Returns products.",
					},
				},
			}),
			async (c) => {
				const { storeID } = c.req.valid("query");
				const cached = await c.env.KV.get(`product_list_${storeID}_${storeID}`);
				if (cached) {
					console.log("Cache hit for product list!");
					return c.json({
						result: JSON.parse(cached),
					});
				}
				const db = c.get("db" as never) as Db;

				const products = await db.query.products.findMany({
					where: (products, { eq, and }) =>
						and(
							eq(products.status, "published"),
							eq(products.storeID, storeID),
						),
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

				await c.env.KV.put(`product_list_${storeID}`, JSON.stringify(products));

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
						storeID: z.string(),
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
				const { handle, storeID } = c.req.valid("query");
				const cached = await c.env.KV.get(
					`collection_handle_${handle}_${storeID}`,
				);
				if (cached) {
					console.log(`Cache hit for collection handle: ${handle}!`);
					return c.json({
						result: JSON.parse(cached),
					});
				}
				const db = c.get("db" as never) as Db;

				const products = await db.query.products.findMany({
					where: (products, { eq, and }) =>
						and(
							eq(products.collectionHandle, handle),
							eq(products.storeID, storeID),
						),
					with: {
						baseVariant: {
							with: {
								prices: true,
							},
						},
					},
				});

				await c.env.KV.put(
					`collection_handle_${handle}`,
					JSON.stringify(products),
				);
				return c.json({
					result: products,
				});
			},
		);
}
