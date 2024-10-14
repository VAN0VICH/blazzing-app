import { Livekit } from "@blazzing-app/core";
import type { WorkerBindings, WorkerEnv } from "@blazzing-app/validators";
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
const ConnectionDetailsSchema = z.object({
	token: z.string(),
	wsUrl: z.string(),
});
const RoomMetadataSchema = z.object({
	creatorIdentity: z.string(),
	enableChat: z.boolean(),
	allowParticipation: z.boolean(),
});
export namespace AuctionApi {
	export const route = new OpenAPIHono<{
		Bindings: WorkerBindings & WorkerEnv;
	}>()
		.openapi(
			createRoute({
				security: [{ Bearer: [] }],
				method: "post",
				path: "/create-stream",
				request: {
					body: {
						content: {
							"application/json": {
								schema: z.object({
									roomName: z.string(),
									metadata: RoomMetadataSchema,
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
									authToken: z.string(),
									connectionDetails: ConnectionDetailsSchema,
								}),
							},
						},
						description: "Creates stream and returns connection details.",
					},
				},
			}),
			async (c) => {
				const controller = new Livekit.Controller(
					c.env.LIVEKIT_SERVER_URL,
					c.env.LIVEKIT_API_KEY,
					c.env.LIVEKIT_SECRET_KEY,
				);
				const body = c.req.valid("json");
				const response = await controller.createStream(body);
				return c.json(response);
			},
		)
		.openapi(
			createRoute({
				security: [{ Bearer: [] }],
				method: "post",
				path: "/remove-from-stage",
				request: {
					body: {
						content: {
							"application/json": {
								schema: z.object({
									identity: z.string(),
								}),
							},
						},
					},
				},
				responses: {
					200: {
						content: {
							"application/json": {
								schema: z.object({ result: z.boolean() }),
							},
						},
						description: "Removes identity from stage.",
					},
				},
			}),
			async (c) => {
				const controller = new Livekit.Controller(
					c.env.LIVEKIT_SERVER_URL,
					c.env.LIVEKIT_API_KEY,
					c.env.LIVEKIT_SECRET_KEY,
				);
				const session = Livekit.getSessionFromReq(
					c.req.raw,
					c.env.LIVEKIT_SECRET_KEY,
				);
				const body = c.req.valid("json");
				try {
					await controller.removeFromStage(session, body);
					return c.json({ result: true });
				} catch (error) {
					console.error(error);
					return c.json({ result: false });
				}
			},
		)
		.openapi(
			createRoute({
				security: [{ Bearer: [] }],
				method: "post",
				path: "/end-stream",
				responses: {
					200: {
						content: {
							"application/json": {
								schema: z.object({
									result: z.boolean(),
								}),
							},
						},
						description: "Removes identity from stage.",
					},
				},
			}),
			async (c) => {
				const controller = new Livekit.Controller(
					c.env.LIVEKIT_SERVER_URL,
					c.env.LIVEKIT_API_KEY,
					c.env.LIVEKIT_SECRET_KEY,
				);
				const session = Livekit.getSessionFromReq(
					c.req.raw,
					c.env.LIVEKIT_SECRET_KEY,
				);
				try {
					await controller.stopStream(session);
					return c.json({ result: true });
				} catch (error) {
					return c.json({ result: false });
				}
			},
		);
}
