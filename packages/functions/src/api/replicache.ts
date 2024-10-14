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
import { zValidator } from "@hono/zod-validator";
import { Effect, Layer } from "effect";
import { Hono } from "hono";
import { z } from "zod";
import { getDB } from "../lib/db";
import { getAuthUser } from "../lib/get-user";

export namespace ReplicacheApi {
	export const route = new Hono<{
		Bindings: WorkerBindings & WorkerEnv;
	}>()
		.get("/hello", (c) => c.text("hello"))
		.post(
			"/pull",
			zValidator(
				"query",
				z.object({
					spaceID: z.enum(["dashboard", "marketplace", "global"] as const),
					subspaces: z.optional(z.array(z.string()).or(z.string())),
				}),
			),
			zValidator("json", PullRequestSchema),
			async (c) => {
				// 1: PARSE INPUT
				const authUser = await getAuthUser(c);
				console.log("USER FROM PULL", authUser);
				const db = getDB({ connectionString: c.env.DATABASE_URL });
				const { spaceID, subspaces } = c.req.valid("query");
				console.log("--------->SPACE ID<-------", spaceID);
				const body = c.req.valid("json");
				console.log("subspaceIDs", subspaces);

				const CloudflareLive = Layer.succeed(
					Cloudflare,
					Cloudflare.of({
						env: c.env,
						request: c.req.raw,
						bindings: {
							KV: c.env.KV,
						},
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

				// 2: PULL
				const pullEffect = pull({
					body,
					db,
				}).pipe(
					Effect.provide(AuthContextLive),
					Effect.provide(CloudflareLive),
					Effect.provide(ReplicacheContextLive),
					Effect.orDie,
				);

				// 3: RUN PROMISE
				const pullResponse = await Effect.runPromise(pullEffect);

				return c.json(pullResponse, 200);
			},
		)
		.post("/static-pull", zValidator("json", PullRequestSchema), async (c) => {
			// 1: PARSE INPUT
			const db = getDB({ connectionString: c.env.DATABASE_URL });
			const body = c.req.valid("json");

			// 2: PULL
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
					}),
				),
				Effect.orDie,
			);

			// 3: RUN PROMISE
			const pullResponse = await Effect.runPromise(pullEffect);

			return c.json(pullResponse, 200);
		})
		.post(
			"/push",
			zValidator(
				"query",
				z.object({
					spaceID: z.enum(["dashboard", "marketplace", "global"] as const),
				}),
			),
			zValidator("json", PushRequestSchema),
			async (c) => {
				const authUser = await getAuthUser(c);

				// 1: PARSE INPUT
				const db = getDB({ connectionString: c.env.DATABASE_URL });
				const { spaceID } = c.req.valid("query");
				const body = c.req.valid("json");

				// 2: PULL
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

				// 3: RUN PROMISE
				await Effect.runPromise(pushEffect);

				return c.json({}, 200);
			},
		);
}
