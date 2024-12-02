import type { Db } from "@blazzing-app/db";
import {
	pull,
	push,
	ReplicacheContext,
	staticPull,
} from "@blazzing-app/replicache";
import { AuthContext, Cloudflare, Database } from "@blazzing-app/shared";
import {
	PullRequestSchema,
	PushRequestSchema,
	type SpaceRecord,
	type WorkerBindings,
	type WorkerEnv,
} from "@blazzing-app/validators";
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { Effect, Layer } from "effect";
import { getAuthUser } from "../lib/get-user";
import { getDB } from "../lib/db";

export namespace ReplicacheApi {
	export const route = new OpenAPIHono<{
		Bindings: WorkerBindings & WorkerEnv;
	}>()
		.openapi(
			createRoute({
				method: "post",
				path: "/pull",
				request: {
					query: z.object({
						spaceID: z.enum([
							"dashboard",
							"marketplace",
							"global",
							"storefront",
							"storefront-dashboard",
						] as const),
						subspaces: z.optional(z.array(z.string()).or(z.string())),
					}),
					body: {
						content: {
							"application/json": {
								schema: PullRequestSchema,
							},
						},
					},
				},
				responses: {
					200: {
						content: {
							"application/json": {
								schema: z.any(), // Replace with actual response schema
							},
						},
						description: "Successful pull operation",
					},
				},
			}),
			async (c) => {
				// 1: PARSE INPUT
				const db = getDB({ connectionString: c.env.DATABASE_URL });
				const { spaceID, subspaces } = c.req.valid("query");
				console.log("--------->SPACE ID<-------", spaceID);
				const body = c.req.valid("json");
				const authUser = await getAuthUser(c);
				const tempUserID = c.req.raw.headers.get("x-temp-user-id");
				c.set("temp-user-id" as never, tempUserID);
				console.log("AUTH FROM PULL", authUser);
				console.log("subspaceIDs", subspaces);

				const CloudflareLive = Layer.succeed(
					Cloudflare,
					Cloudflare.of({
						env: c.env,
						request: c.req.raw,
						bindings: {
							KV: c.env.KV,
						},
						get: c.get,
					}),
				);
				const ReplicacheContextLive = Layer.succeed(
					ReplicacheContext,
					ReplicacheContext.of({
						spaceID,
						clientGroupID: body.clientGroupID,
						subspaceIDs:
							typeof subspaces === "string"
								? [subspaces]
								: (subspaces as SpaceRecord[typeof spaceID] | undefined),
					}),
				);

				const AuthContextLive = Layer.succeed(
					AuthContext,
					AuthContext.of({
						authUser,
					}),
				);

				const pullEffect = pull({
					body,
					db,
				}).pipe(
					Effect.provide(AuthContextLive),
					Effect.provide(CloudflareLive),
					Effect.provide(ReplicacheContextLive),
					Effect.orDie,
				);

				const pullResponse = await Effect.runPromise(pullEffect);

				return c.json(pullResponse, 200);
			},
		)
		.openapi(
			createRoute({
				method: "post",
				path: "/static-pull",
				request: {
					body: {
						content: {
							"application/json": {
								schema: PullRequestSchema,
							},
						},
					},
				},
				responses: {
					200: {
						content: {
							"application/json": {
								schema: z.any(), // Replace with actual response schema
							},
						},
						description: "Successful static pull operation",
					},
				},
			}),
			async (c) => {
				const db = c.get("db" as never) as Db;
				const body = c.req.valid("json");

				const pullEffect = staticPull({ body }).pipe(
					Effect.provideService(Database, { manager: db }),
					Effect.provideService(
						Cloudflare,
						Cloudflare.of({
							env: c.env,
							request: c.req.raw,
							bindings: {
								KV: c.env.KV,
							},
							get: c.get,
						}),
					),
					Effect.orDie,
				);

				const pullResponse = await Effect.runPromise(pullEffect);

				return c.json(pullResponse, 200);
			},
		)
		.openapi(
			createRoute({
				method: "post",
				path: "/push",
				request: {
					query: z.object({
						spaceID: z.enum([
							"dashboard",
							"marketplace",
							"global",
							"storefront",
							"storefront-dashboard",
						] as const),
					}),
					body: {
						content: {
							"application/json": {
								schema: PushRequestSchema,
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
						description: "Successful push operation",
					},
				},
			}),
			async (c) => {
				const authUser = await getAuthUser(c);

				const db = c.get("db" as never) as Db;
				const { spaceID } = c.req.valid("query");
				const body = c.req.valid("json");
				const tempUserID = c.req.raw.headers.get("x-temp-user-id");
				c.set("temp-user-id" as never, tempUserID);

				const pushEffect = push({
					body,
					db,
					partyKitOrigin: c.env.PARTYKIT_ORIGIN,
				}).pipe(
					Effect.provideService(
						AuthContext,
						AuthContext.of({
							authUser,
						}),
					),
					Effect.provideService(
						Cloudflare,
						Cloudflare.of({
							env: c.env,
							request: c.req.raw,
							bindings: {
								KV: c.env.KV,
							},
							get: c.get,
						}),
					),
					Effect.provideService(
						ReplicacheContext,
						ReplicacheContext.of({
							spaceID,
							clientGroupID: body.clientGroupID,
							subspaceIDs: undefined,
						}),
					),
					Effect.scoped,
					Effect.orDie,
				);

				await Effect.runPromise(pushEffect);

				return c.json({}, 200);
			},
		);
}
