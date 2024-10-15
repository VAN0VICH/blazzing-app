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
  import { getDB } from "../lib/db";
  import { getAuthUser } from "../lib/get-user";
  
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
			  spaceID: z.enum(["dashboard", "marketplace", "global"] as const),
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
		  const db = getDB({ connectionString: c.env.DATABASE_URL });
		  const { spaceID, subspaces } = c.req.valid("query");
		  console.log("--------->SPACE ID<-------", spaceID);
		  const body = c.req.valid("json");
          const authUser = await getAuthUser(c);
		  console.log("USER FROM PULL", authUser);
		  console.log("subspaceIDs", subspaces);
  
		  const CloudflareLive = Layer.succeed(
			Cloudflare,
			Cloudflare.of({
			  env: c.env,
			  request: c.req.raw,
			  bindings: {
				KV: c.env.KV,
			  },
			})
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
			})
		  );
  
		  const AuthContextLive = Layer.succeed(
			AuthContext,
			AuthContext.of({
			  authUser,
			})
		  );
  
		  const pullEffect = pull({
			body,
			db,
		  }).pipe(
			Effect.provide(AuthContextLive),
			Effect.provide(CloudflareLive),
			Effect.provide(ReplicacheContextLive),
			Effect.orDie
		  );
  
		  const pullResponse = await Effect.runPromise(pullEffect);
  
		  return c.json(pullResponse, 200);
		}
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
		  const db = getDB({ connectionString: c.env.DATABASE_URL });
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
			  })
			),
			Effect.orDie
		  );
  
		  const pullResponse = await Effect.runPromise(pullEffect);
  
		  return c.json(pullResponse, 200);
		}
	  )
	  .openapi(
		createRoute({
		  method: "post",
		  path: "/push",
		  request: {
			query: z.object({
			  spaceID: z.enum(["dashboard", "marketplace", "global"] as const),
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
  
		  const db = getDB({ connectionString: c.env.DATABASE_URL });
		  const { spaceID } = c.req.valid("query");
		  const body = c.req.valid("json");
  
		  const pushEffect = push({
			body,
			db,
			partyKitOrigin: c.env.PARTYKIT_ORIGIN,
		  }).pipe(
			Effect.provideService(
			  AuthContext,
			  AuthContext.of({
				authUser,
			  })
			),
			Effect.provideService(
			  Cloudflare,
			  Cloudflare.of({
				env: c.env,
				request: c.req.raw,
				bindings: {
				  KV: c.env.KV,
				},
			  })
			),
			Effect.provideService(
			  ReplicacheContext,
			  ReplicacheContext.of({
				spaceID,
				clientGroupID: body.clientGroupID,
				subspaceIDs: undefined,
			  })
			),
			Effect.scoped,
			Effect.orDie
		  );
  
		  await Effect.runPromise(pushEffect);
  
		  return c.json({}, 200);
		}
	  );
  }