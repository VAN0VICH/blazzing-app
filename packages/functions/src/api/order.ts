import type { Db } from "@blazzing-app/db";
import {
	ProductOptionValueSchema,
	ShippingAddressSchema,
	type WorkerBindings,
	type WorkerEnv,
} from "@blazzing-app/validators";
import {
	LineItemSchema,
	OrderSchema,
	PriceSchema,
	VariantSchema,
} from "@blazzing-app/validators";
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { cache } from "hono/cache";
export namespace OrderApi {
	//@ts-ignore
	export const route = new OpenAPIHono<{
		Bindings: WorkerBindings & WorkerEnv;
	}>().openapi(
		createRoute({
			security: [{ Bearer: [] }],
			method: "get",
			path: "/id",
			request: {
				query: z.object({
					id: z.optional(z.array(z.string()).or(z.string())),
				}),
			},
			middleware: [
				cache({
					cacheName: "blazzing-cache",
				}),
			],
			responses: {
				200: {
					content: {
						"application/json": {
							schema: z.object({
								result: z.array(
									OrderSchema.extend({
										items: z.array(
											LineItemSchema.extend({
												variant: VariantSchema.extend({
													prices: z.array(PriceSchema),
													optionValues: z.array(
														z.object({
															optionValue: ProductOptionValueSchema,
														}),
													),
												}),
											}),
										),
										shippingAddress: ShippingAddressSchema,
									}),
								),
							}),
						},
					},
					description: "Creates orders, clears the cart and returns order IDs",
				},
			},
		}),
		//@ts-ignore
		async (c) => {
			const { id } = c.req.valid("query");
			const cached = await c.env.KV.get(`order_${JSON.stringify(id)}`);
			if (cached) {
				return c.json({
					result: JSON.parse(cached),
				});
			}

			if (!id) return [];
			const db = c.get("db" as never) as Db;
			const result = await db.query.orders.findMany({
				where: (orders, { inArray }) =>
					inArray(orders.id, typeof id === "string" ? [id] : id),
				with: {
					items: {
						with: {
							variant: {
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
									prices: true,
								},
							},
							product: {
								with: {
									baseVariant: true,
								},
							},
						},
					},
					shippingAddress: true,
					billingAddress: true,
					store: {
						columns: {
							id: true,
							image: true,
							name: true,
						},
					},
				},
			});

			if (!result) return [];
			await c.env.KV.put(`order_${JSON.stringify(id)}`, JSON.stringify(result));

			return c.json({ result });
		},
	);
}
