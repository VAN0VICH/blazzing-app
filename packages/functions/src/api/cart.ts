import { CartService } from "@blazzing-app/core";
import { Cloudflare, Database } from "@blazzing-app/shared";
import {
	CheckoutFormSchema,
	type WorkerBindings,
	type WorkerEnv,
} from "@blazzing-app/validators";
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { Effect } from "effect";
import { getDB } from "../lib/db";
export namespace CartApi {
	export const route = new OpenAPIHono<{
		Bindings: WorkerBindings & WorkerEnv;
	}>().openapi(
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
					description: "Creates orders, clears the cart and returns order IDs",
				},
			},
		}),
		//@ts-ignore
		async (c) => {
			const { checkoutInfo, id } = c.req.valid("json");
			const db = getDB({ connectionString: c.env.DATABASE_URL });

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
					}),
				),
			);

			return c.json({ result: orderIDs });
		},
	);
}
