import { Controller, getSessionFromReq } from "@blazzing-app/core";
import type { WorkerBindings } from "@blazzing-app/validators";
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
	export const route = new OpenAPIHono<{ Bindings: WorkerBindings }>()
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
				const controller = new Controller(
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
								schema: z.object({}),
							},
						},
						description: "Removes identity from stage.",
					},
				},
			}),
			async (c) => {
				const controller = new Controller(
					c.env.LIVEKIT_SERVER_URL,
					c.env.LIVEKIT_API_KEY,
					c.env.LIVEKIT_SECRET_KEY,
				);
				const session = getSessionFromReq(c.req.raw, c.env.LIVEKIT_SECRET_KEY);
				const body = c.req.valid("json");
				await controller.removeFromStage(session, body);
				return c.json({});
			},
		);
}
