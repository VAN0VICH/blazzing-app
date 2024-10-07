import { Console, Effect, pipe } from "effect";

import type { TableName } from "@blazzing-app/db";
import { Cloudflare, Database } from "@blazzing-app/shared";
import { NeonDatabaseError } from "@blazzing-app/validators";
import type { GetRowsWTableName } from "../types";

export const notificationsCVD: GetRowsWTableName = ({ fullRows = false }) => {
	return Effect.gen(function* () {
		const { request } = yield* Cloudflare;
		const userID = request.headers.get("x-user-id");
		const globalID = request.headers.get("x-global-id");
		const id = userID ?? globalID;
		if (!id) return [];
		const { manager } = yield* Database;

		const store = yield* Effect.tryPromise(() =>
			manager.query.stores.findFirst({
				where: (stores, { eq }) => eq(stores.ownerID, id),
			}),
		).pipe(
			Effect.catchTags({
				UnknownException: (error) =>
					new NeonDatabaseError({ message: error.message }),
			}),
		);
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
		yield* Console.log("notificationsCVD", JSON.stringify(notificationsCVD));
		return notificationsCVD;
	});
};
