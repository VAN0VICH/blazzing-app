import {
	AddAdminSchema,
	NeonDatabaseError,
	RemoveAdminSchema,
} from "@blazzing-app/validators";
import { Console, Effect } from "effect";
import { fn } from "../../util/fn";
import { AuthContext, Database } from "@blazzing-app/shared";
import { schema } from "@blazzing-app/db";
import { and, eq } from "drizzle-orm";
import { TableMutator } from "../../context";

const addAdmin = fn(AddAdminSchema, (input) =>
	Effect.gen(function* () {
		const tableMutator = yield* TableMutator;
		const { authUser } = yield* AuthContext;
		const { manager } = yield* Database;
		const { email, storeID } = input;
		if (!authUser) return;
		const [store, user] = yield* Effect.all(
			[
				Effect.tryPromise(() =>
					manager.query.stores.findFirst({
						where: (stores, { eq }) => eq(stores.id, storeID),
						columns: {
							id: true,
							ownerID: true,
						},
					}),
				),

				Effect.tryPromise(() =>
					manager.query.users.findFirst({
						where: (users, { eq }) => eq(users.email, email),
						columns: {
							id: true,
						},
					}),
				),
			],
			{
				concurrency: 2,
			},
		).pipe(
			Effect.catchTags({
				UnknownException: () =>
					new NeonDatabaseError({ message: "Error adding admins" }),
			}),
		);
		if (store?.ownerID !== authUser?.userID || !user) {
			yield* Console.log("Not an owner or email does not exist");
			return;
		}

		yield* Effect.tryPromise(() =>
			manager
				.insert(schema.adminsToStores)
				.values({
					storeID: store.id,
					userID: user.id,
				})
				.onConflictDoNothing()
				.catch((error) => {
					console.log("error adding admins", error);
					throw new Error("Error adding admins");
				}),
		).pipe(
			Effect.catchTags({
				UnknownException: () =>
					new NeonDatabaseError({ message: "Error adding admins" }),
			}),
		);
		yield* tableMutator.update(store.id, {}, "stores");
	}),
);

const removeAdmin = fn(RemoveAdminSchema, (input) => {
	return Effect.gen(function* () {
		const tableMutator = yield* TableMutator;
		const { authUser } = yield* AuthContext;
		const { manager } = yield* Database;
		const { email, storeID } = input;
		if (!authUser) return;

		const [store, user] = yield* Effect.all(
			[
				Effect.tryPromise(() =>
					manager.query.stores.findFirst({
						where: (stores, { eq }) => eq(stores.id, storeID),
						columns: {
							id: true,
							ownerID: true,
						},
					}),
				),

				Effect.tryPromise(() =>
					manager.query.users.findFirst({
						where: (users, { eq }) => eq(users.email, email),
						columns: {
							id: true,
						},
					}),
				),
			],
			{ concurrency: 2 },
		).pipe(
			Effect.catchTags({
				UnknownException: () =>
					new NeonDatabaseError({ message: "Error removing admins" }),
			}),
		);
		if (store?.ownerID !== authUser?.userID || !user) {
			yield* Console.log("Not an owner or email does not exist");
			return;
		}

		yield* Effect.tryPromise(() =>
			manager
				.delete(schema.adminsToStores)
				.where(
					and(
						eq(schema.adminsToStores.userID, user.id),
						eq(schema.adminsToStores.storeID, storeID),
					),
				)
				.catch((error) => {
					console.log("error removing admins", error);
					throw new Error("Error removing admins");
				}),
		).pipe(
			Effect.catchTags({
				UnknownException: () =>
					new NeonDatabaseError({ message: "Error adding admins" }),
			}),
		);
		yield* tableMutator.update(store.id, {}, "stores");
	});
});
export { addAdmin, removeAdmin };
