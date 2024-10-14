import { UserService } from "@blazzing-app/core";
import { Database } from "@blazzing-app/shared";
import type { WorkerBindings, WorkerEnv } from "@blazzing-app/validators";
import { UserSchema } from "@blazzing-app/validators/server";
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { Console, Effect } from "effect";
import { getDB } from "../lib/db";
import { getAuthUser } from "../lib/get-user";
export namespace UserApi {
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
						id: z.string(),
					}),
				},
				responses: {
					200: {
						content: {
							"application/json": {
								schema: z.object({
									result: z.nullable(UserSchema),
								}),
							},
						},
						description: "Returns user by id.",
					},
				},
			}),
			//@ts-ignore
			async (c) => {
				const { id } = c.req.valid("query");
				const db = getDB({ connectionString: c.env.DATABASE_URL });

				const user = await db.query.users.findFirst({
					where: (users, { eq }) => eq(users.id, id),
					with: {
						stores: true,
						addresses: true,
					},
				});
				return c.json({ result: user ?? null });
			},
		)
		.openapi(
			createRoute({
				security: [{ Bearer: [] }],
				method: "get",
				path: "/username",
				request: {
					query: z.object({
						username: z.string(),
					}),
				},
				responses: {
					200: {
						content: {
							"application/json": {
								schema: z.object({
									result: z.nullable(UserSchema),
								}),
							},
						},
						description: "Returns user by username.",
					},
				},
			}),
			//@ts-ignore
			async (c) => {
				const { username } = c.req.valid("query");

				const db = getDB({ connectionString: c.env.DATABASE_URL });

				const user = await db.query.users.findFirst({
					where: (users, { eq }) => eq(users.username, username),
					with: {
						stores: true,
						addresses: true,
					},
				});
				return c.json({ result: user ?? null });
			},
		)
		.openapi(
			createRoute({
				security: [{ Bearer: [] }],
				method: "post",
				path: "/onboard",
				request: {
					body: {
						content: {
							"application/json": {
								schema: z.object({
									username: z.string(),
									countryCode: z.string(),
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
									message: z.string().optional(),
								}),
							},
						},
						description: "Returns user by email.",
					},
				},
			}),
			async (c) => {
				const { countryCode, username } = c.req.valid("json");
				const authUser = await getAuthUser(c);
				if (!authUser) {
					console.error("Unauthorized");
					return c.json({ success: false, message: "Unauthorized" });
				}
				const db = getDB({ connectionString: c.env.DATABASE_URL });
				await Effect.runPromise(
					Effect.gen(function* () {
						yield* Effect.tryPromise(() =>
							db.transaction(async (tx) =>
								UserService.onboard({
									countryCode,
									username,
									authUser,
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
				return c.json({
					success: true,
				});
			},
		);
}
