import { AuthContext, Database } from "@blazzing-app/shared";
import {
	NeonDatabaseError,
	type InsertStore,
	type InsertUser,
} from "@blazzing-app/validators";
import { Console, Effect } from "effect";
import { generateID } from "@blazzing-app/utils";
import { schema } from "@blazzing-app/db";
import { eq, sql } from "drizzle-orm";
import { fn } from "../util/fn";
import { z } from "zod";

export namespace UserService {
	export const onboard = fn(
		z.object({
			countryCode: z.string(),
			username: z.string(),
		}),

		({ countryCode, username }) =>
			Effect.gen(function* () {
				const { manager } = yield* Database;
				const { authUser } = yield* AuthContext;
				yield* Console.log("AUTH AUTH AUTH AUTH ", authUser, username);
				if (!authUser) return;
				const user: InsertUser = {
					id: generateID({ prefix: "user" }),
					createdAt: new Date().toISOString(),
					version: 0,
					username,
					email: authUser.email,
					...(authUser.id && { authID: authUser.id }),
					...(authUser.avatar && { avatar: authUser.avatar }),
					...(authUser.fullName && { fullName: authUser.fullName }),
				};
				const store: InsertStore = {
					id: generateID({ prefix: "store" }),
					createdAt: new Date().toISOString(),
					name: username,
					version: 0,
					ownerID: user.id,
					countryCode,
				};

				yield* Effect.tryPromise(() =>
					manager
						.insert(schema.users)
						//@ts-ignore
						.values(user)
						.onConflictDoUpdate({
							target: schema.users.id,
							set: {
								version: sql`${schema.users.version} + 1`,
								username,
								authID: authUser.id,
								...(authUser.avatar && { avatar: authUser.avatar }),
							},
						}),
				);
				yield* Console.log("USER USER USER USER USER ", username);
				yield* Effect.all(
					[
						Effect.tryPromise(() =>
							manager
								.update(schema.authUsers)
								.set({
									username,
									userID: user.id,
								})
								.where(eq(schema.authUsers.id, authUser.id)),
						),
						Effect.tryPromise(
							//@ts-ignore
							() => manager.insert(schema.stores).values(store),
						),
					],
					{ concurrency: 2 },
				);
				yield* Effect.tryPromise(() =>
					manager
						.insert(schema.jsonTable)
						.values({
							id: `active_store_id_${user.authID}`,
							version: 0,
							value: store.id,
						})
						.onConflictDoUpdate({
							target: schema.jsonTable.id,
							set: {
								version: sql`${schema.jsonTable.version} + 1`,
								value: store.id,
							},
						}),
				);
			}).pipe(
				Effect.catchTags({
					UnknownException: (error) => {
						console.error(error);
						return new NeonDatabaseError({ message: error.message });
					},
				}),
			),
	);
}
