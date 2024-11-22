import { CartService } from "@blazzing-app/core";
import type { Db } from "@blazzing-app/db";
import { Cloudflare, Database } from "@blazzing-app/shared";
import {
	CheckoutFormSchema,
	type WorkerBindings,
	type WorkerEnv,
} from "@blazzing-app/validators";
import {
	CartSchema,
	LineItemSchema,
	ProductSchema,
	VariantSchema,
} from "@blazzing-app/validators/server";
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { Effect } from "effect";
const fullCartSchema = CartSchema.extend({
	items: z.array(
		LineItemSchema.extend({
			product: ProductSchema.extend({
				baseVariant: VariantSchema,
			}),
			variant: VariantSchema.extend({
				optionValues: z.array(
					z.object({
						optionValue: z.object({
							value: z.string(),
						}),
					}),
				),
				prices: z.array(
					z.object({
						amount: z.number(),
						currency: z.string(),
					}),
				),
			}),
		}),
	),
});
export namespace CartApi {
	export const route = new OpenAPIHono<{
		Bindings: WorkerBindings & WorkerEnv;
	}>()
		.openapi(
			createRoute({
				security: [{ Bearer: [] }],
				method: "get",
				path: "/cart",
				request: {
					params: z.object({
						id: z.string(),
					}),
				},
				responses: {
					200: {
						content: {
							"application/json": {
								schema: z.object({
									result: z.nullable(fullCartSchema),
								}),
							},
						},
						description: "Returns cart by id.",
					},
				},
			}),
			async (c) => {
				const { id } = c.req.valid("param");
				const db = c.get("db" as never) as Db;

				const cart = await db.query.carts.findFirst({
					where: (carts, { eq }) => eq(carts.id, id),
					with: {
						shippingAddress: true,
						items: {
							with: {
								product: {
									with: {
										baseVariant: true,
									},
								},
								variant: {
									with: {
										optionValues: true,
										prices: true,
									},
								},
							},
						},
					},
				});
				if (!cart) {
					return c.json({
						result: null,
					});
				}

				return c.json({
					result: cart,
				});
			},
		)
		.openapi(
			createRoute({
				security: [{ Bearer: [] }],
				method: "post",
				path: "/complete-cart",
				request: {
					body: {
						content: {
							"application/json": {
								schema: z.object({
									checkoutInfo: CheckoutFormSchema,
									id: z.string(),
								}),
							},
						},
					},
				},
				responses: {
					200: {
						content: {
							"application/json": {
								schema: z.object({
									result: z.array(z.string()),
								}),
							},
						},
						description:
							"Creates orders, clears the cart and returns order IDs",
					},
				},
			}),
			//@ts-ignore
			async (c) => {
				const { checkoutInfo, id } = c.req.valid("json");

				const db = c.get("db" as never) as Db;
				const orderIDs = await Effect.runPromise(
					CartService.completeCart({
						checkoutInfo,
						id,
					}).pipe(
						Effect.provideService(Database, {
							manager: db,
						}),
						Effect.provideService(Cloudflare, {
							bindings: {
								KV: c.env.KV,
							},
							env: c.env,
							request: c.req.raw,
							get: c.get,
						}),
					),
				);

				return c.json({ result: orderIDs });
			},
		);
}
