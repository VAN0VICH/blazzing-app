import { UserService } from "@blazzing-app/core";
import { schema } from "@blazzing-app/db";
import { Database } from "@blazzing-app/shared";
import { generateID } from "@blazzing-app/utils";
import type {
	GoogleProfile,
	InsertAuth,
	WorkerBindings,
	WorkerEnv,
} from "@blazzing-app/validators";
import { AuthUserSchema, SessionSchema } from "@blazzing-app/validators/server";
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { generateCodeVerifier, generateState, Google } from "arctic";
import { eq, lte } from "drizzle-orm";
import { Console, Effect } from "effect";
import { cache } from "hono/cache";
import { createDate, TimeSpan } from "oslo";
import { getDB } from "../lib/db";
export namespace AuthApi {
	export const route = new OpenAPIHono<{
		Bindings: WorkerBindings & WorkerEnv;
	}>()
		.openapi(
			createRoute({
				security: [{ Bearer: [] }],
				method: "get",
				path: "/user-and-session",
				request: {
					query: z.object({
						sessionID: z.string(),
					}),
				},
				responses: {
					200: {
						content: {
							"application/json": {
								schema: z.object({
									user: z.nullable(AuthUserSchema),
									session: z.nullable(SessionSchema),
								}),
							},
						},
						description: "Returns user and session.",
					},
				},
			}),
			async (c) => {
				const { sessionID } = c.req.valid("query");

				const db = getDB({ connectionString: c.env.DATABASE_URL });

				const session = await db.query.sessions.findFirst({
					where: (sessions, { eq }) => eq(sessions.id, sessionID),
					with: {
						user: true,
					},
				});
				return c.json({
					user: session?.user ?? null,
					session: session ?? null,
				});
			},
		)
		.openapi(
			createRoute({
				security: [{ Bearer: [] }],
				method: "post",
				path: "/create-session",

				request: {
					body: {
						content: {
							"application/json": {
								schema: z.object({
									authID: z.string(),
									expiresAt: z.string(),
								}),
							},
						},
					},
				},
				responses: {
					200: {
						content: {
							"application/json": {
								schema: SessionSchema,
							},
						},
						description: "Creates and returns session.",
					},
				},
			}),
			async (c) => {
				const { authID, expiresAt } = c.req.valid("json");
				const db = getDB({ connectionString: c.env.DATABASE_URL });

				const session = {
					id: generateID({ prefix: "session" }),
					authID,
					createdAt: new Date().toISOString(),
					expiresAt,
				};
				await db.insert(schema.sessions).values(session).returning();
				return c.json(session);
			},
		)
		.openapi(
			createRoute({
				method: "post",
				path: "/delete-session",
				request: {
					body: {
						content: {
							"application/json": {
								schema: z.object({
									sessionID: z.string(),
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
									success: z.boolean(),
								}),
							},
						},
						description: "Deletes session.",
					},
				},
			}),
			async (c) => {
				const { sessionID } = c.req.valid("json");
				const db = getDB({ connectionString: c.env.DATABASE_URL });
				await db
					.delete(schema.sessions)
					.where(eq(schema.sessions.id, sessionID));
				return c.json(
					{
						success: true,
					},
					200,
				);
			},
		)
		.openapi(
			createRoute({
				security: [{ Bearer: [] }],
				method: "post",
				path: "/delete-expired-session",
				responses: {
					200: {
						content: {
							"application/json": {
								schema: z.object({
									success: z.boolean(),
								}),
							},
						},
						description: "Deletes expired sessions.",
					},
				},
			}),
			async (c) => {
				const db = getDB({ connectionString: c.env.DATABASE_URL });
				await db
					.delete(schema.sessions)
					.where(lte(schema.sessions.expiresAt, new Date().toISOString()));
				return c.json({
					success: true,
				});
			},
		)
		.openapi(
			createRoute({
				security: [{ Bearer: [] }],
				method: "get",
				path: "/google",
				responses: {
					200: {
						content: {
							"application/json": {
								schema: z.object({
									url: z.string().optional(),
									codeVerifier: z.string().optional(),
									state: z.string().optional(),
									success: z.boolean(),
								}),
							},
						},
						description: "Get google authentication url.",
					},
				},
			}),
			async (c) => {
				console.log("is it even here");

				const google = new Google(
					c.env.GOOGLE_CLIENT_ID,
					c.env.GOOGLE_CLIENT_SECRET,
					`${c.env.WEB_URL}/google/callback`,
				);
				const state = generateState();
				const codeVerifier = generateCodeVerifier();
				try {
					const googleURL = await google.createAuthorizationURL(
						state,
						codeVerifier,
						{
							scopes: ["openid", "email", "profile"],
						},
					);

					return c.json({
						codeVerifier,
						state,
						success: true,
						url: googleURL,
					});
				} catch (error) {
					console.error(error);
					return c.json({
						success: false,
					});
				}
			},
		)
		.openapi(
			createRoute({
				security: [{ Bearer: [] }],
				method: "post",
				path: "/google-callback",
				request: {
					body: {
						content: {
							"application/json": {
								schema: z.object({
									code: z.string(),
									codeVerifier: z.string(),
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
									session: SessionSchema.optional(),
									isOnboard: z.boolean(),
									success: z.boolean(),
									message: z.string().optional(),
								}),
							},
						},
						description: "Creates user and returns the session.",
					},
				},
			}),
			async (c) => {
				const { code, codeVerifier } = c.req.valid("json");
				const db = getDB({ connectionString: c.env.DATABASE_URL });
				try {
					const google = new Google(
						c.env.GOOGLE_CLIENT_ID,
						c.env.GOOGLE_CLIENT_SECRET,
						`${c.env.WEB_URL}/google/callback`,
					);

					const tokens = await google.validateAuthorizationCode(
						code,
						codeVerifier,
					);
					const googleUserResponse = await fetch(
						"https://www.googleapis.com/oauth2/v3/userinfo",
						{
							headers: {
								Authorization: `Bearer ${tokens.accessToken}`,
							},
						},
					);
					const googleUserResult: GoogleProfile =
						(await googleUserResponse.json()) as GoogleProfile;
					let isOnboard = false;

					let authUser = await db.query.authUsers.findFirst({
						where: (authUsers, { eq, or }) =>
							or(
								eq(authUsers.googleID, googleUserResult.sub),
								eq(authUsers.email, googleUserResult.email),
							),
					});

					if (!authUser) {
						isOnboard = true;
						const [newAuthUser] = await db
							.insert(schema.authUsers)
							.values({
								id: generateID({ prefix: "auth" }),
								googleID: googleUserResult.sub,
								email: googleUserResult.email,
								...(googleUserResult.picture && {
									avatar: googleUserResult.picture,
								}),
								...(googleUserResult.name && {
									fullName: googleUserResult.name,
								}),
								createdAt: new Date().toISOString(),
								version: 1,
							})
							.returning();
						if (newAuthUser) {
							authUser = newAuthUser;
						} else {
							return c.json({
								success: false,
								message: "Failed to create user",
								isOnboard: false,
							});
						}
					}

					if (!authUser.username) {
						isOnboard = true;
					}
					const sessionExpiresIn = new TimeSpan(30, "d");
					const expiresAt = createDate(sessionExpiresIn).toISOString();
					const session = {
						id: generateID({ prefix: "session" }),
						authID: authUser!.id,
						createdAt: new Date().toISOString(),
						expiresAt,
					};
					await db.insert(schema.sessions).values(session).returning();
					return c.json({
						success: true,
						isOnboard,
						session,
					});
				} catch (error) {
					console.error(error);
					return c.json({
						success: false,
						message: "Failed to authenticate user",
						isOnboard: false,
					});
				}
			},
		)
		.openapi(
			createRoute({
				security: [{ Bearer: [] }],
				method: "post",
				path: "/create-test-user",
				responses: {
					200: {
						content: {
							"application/json": {
								schema: z.object({
									session: SessionSchema.optional(),
									success: z.boolean(),
									message: z.string().optional(),
								}),
							},
						},
						description: "Creates test user and returns the session.",
					},
				},
			}),
			async (c) => {
				const db = getDB({ connectionString: c.env.DATABASE_URL });

				const testID = `test-${generateID({})}`;

				const testAuthUser: InsertAuth = {
					id: generateID({ prefix: "auth" }),
					createdAt: new Date().toISOString(),
					email: testID,
					version: 1,
					username: testID,
				};

				await db.insert(schema.authUsers).values(testAuthUser);

				await Effect.runPromise(
					Effect.gen(function* () {
						yield* Effect.tryPromise(() =>
							db.transaction(async (tx) =>
								UserService.onboard({
									countryCode: "AU",
									username: testID,
									authUser: testAuthUser,
								})
									.pipe(
										Effect.provideService(
											Database,
											Database.of({ manager: tx }),
										),
									)
									.pipe(Effect.orDie),
							),
						).pipe(
							Effect.flatMap((_) => _),
							Effect.retry({ times: 3 }),
							Effect.catchAll((e) =>
								Effect.gen(function* () {
									yield* Console.log(e.message);
									yield* Effect.succeed({
										status: "error",
										message: "Failed to onboard user",
									});
								}),
							),
							Effect.zipLeft(
								Effect.all([
									Effect.tryPromise(() =>
										fetch(`${c.env.PARTYKIT_ORIGIN}/parties/main/dashboard`, {
											method: "POST",
											body: JSON.stringify(["store"]),
										}),
									),
									Effect.tryPromise(() =>
										fetch(`${c.env.PARTYKIT_ORIGIN}/parties/main/global`, {
											method: "POST",
											body: JSON.stringify(["user"]),
										}),
									),
								]),
							),
						);
					}),
				);

				const sessionExpiresIn = new TimeSpan(30, "d");
				const expiresAt = createDate(sessionExpiresIn).toISOString();
				const session = {
					id: generateID({ prefix: "session" }),
					authID: testAuthUser!.id,
					createdAt: new Date().toISOString(),
					expiresAt,
				};
				await db.insert(schema.sessions).values(session).returning();
				return c.json({
					success: true,
					session,
				});
			},
		);
}
