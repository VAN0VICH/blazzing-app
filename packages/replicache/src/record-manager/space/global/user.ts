import { Console, Effect, pipe } from "effect";

import { AuthContext, Database } from "@blazzing-app/shared";
import { NeonDatabaseError } from "@blazzing-app/validators";
import type { GetRowsWTableName } from "../types";

export const userCVD: GetRowsWTableName = ({ fullRows = false }) => {
	return Effect.gen(function* () {
		const { manager } = yield* Database;
		const { authUser } = yield* AuthContext;
		const user = authUser
			? yield* Effect.tryPromise(() =>
					manager.query.users.findFirst({
						where: (users, { eq }) => eq(users.authID, authUser.id),
						columns: {
							id: true,
						},
					}),
				).pipe(
					Effect.tapError((err) =>
						Effect.sync(() => {
							console.error("Raw error before wrapping:", err);
						}),
					),
					Effect.catchTags({
						UnknownException: () =>
							new NeonDatabaseError({
								message: "error getting user:global:user",
							}),
					}),
				)
			: undefined;
		const userID = user?.id;
		if (!userID) return [];
		const result = yield* pipe(
			Effect.tryPromise(() =>
				fullRows
					? manager.query.users.findFirst({
							where: (users, { eq }) => eq(users.id, userID!),
						})
					: manager.query.users.findFirst({
							columns: {
								id: true,
								version: true,
							},
							where: (users, { eq }) => eq(users.id, userID!),
						}),
			),
			Effect.map((user) => [
				{ tableName: "users" as const, rows: user ? [user] : [] },
			]),
			Effect.catchTags({
				UnknownException: (error) =>
					new NeonDatabaseError({ message: error.message }),
			}),
		);
		yield* Console.log("USER CVD RESULT", JSON.stringify(result));
		return result;
	});
};
