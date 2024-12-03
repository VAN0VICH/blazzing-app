import { Effect, pipe } from "effect";

import type { TableName } from "@blazzing-app/db";
import { AuthContext, Cloudflare, Database } from "@blazzing-app/shared";
import { NeonDatabaseError } from "@blazzing-app/validators";
import type { GetRowsWTableName } from "../types";

export const notificationsCVD: GetRowsWTableName = ({ fullRows = false }) => {
	return Effect.gen(function* () {
		const { request } = yield* Cloudflare;
		const { authUser } = yield* AuthContext;

		const id = request.headers.get("x-temp-user-id");
		const { manager } = yield* Database;

		const user = authUser
			? yield* Effect.tryPromise(() =>
					manager.query.users
						.findFirst({
							where: (users, { eq }) => eq(users.authID, authUser?.id),
							columns: {
								id: true,
							},
						})
						.catch((err) => {
							console.error(err);
							throw err;
						}),
				).pipe(
					Effect.catchTags({
						UnknownException: () =>
							new NeonDatabaseError({
								message: "error getting user:notification:notification",
							}),
					}),
				)
			: undefined;
		const userID = user?.id;

		const store = userID
			? yield* Effect.tryPromise(() =>
					manager.query.stores.findFirst({
						where: (stores, { eq }) => eq(stores.ownerID, userID),
					}),
				).pipe(
					Effect.catchTags({
						UnknownException: (error) =>
							new NeonDatabaseError({ message: error.message }),
					}),
				)
			: undefined;
		const ids = [id, store?.id].filter(Boolean) as string[];
		const notificationsCVD = yield* pipe(
			Effect.tryPromise(() =>
				fullRows
					? manager.query.notifications.findMany({
							where: (notifications, { inArray }) =>
								inArray(notifications.entityID, ids),
						})
					: manager.query.notifications.findMany({
							columns: {
								id: true,
								version: true,
							},
							where: (notifications, { inArray }) =>
								inArray(notifications.entityID, ids),
						}),
			),
			Effect.map((notifications) => [
				{
					tableName: "notifications" as const satisfies TableName,
					rows: notifications,
				},
			]),
			Effect.catchTags({
				UnknownException: (error) =>
					new NeonDatabaseError({ message: error.message }),
			}),
		);
		return notificationsCVD;
	});
};
