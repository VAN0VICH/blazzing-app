import { Console, Effect, pipe } from "effect";

import { AuthContext, Database } from "@blazzing-app/shared";
import { NeonDatabaseError } from "@blazzing-app/validators";
import type { GetRowsWTableName } from "../types";

export const userCVD: GetRowsWTableName = ({ fullRows = false }) => {
	return Effect.gen(function* () {
		const { authUser } = yield* AuthContext;
		if (!authUser?.userID) return [];
		const { manager } = yield* Database;
		const result = yield* pipe(
			Effect.tryPromise(() =>
				fullRows
					? manager.query.users.findFirst({
							where: (users, { eq }) => eq(users.id, authUser.userID!),
						})
					: manager.query.users.findFirst({
							columns: {
								id: true,
								version: true,
							},
							where: (users, { eq }) => eq(users.id, authUser.userID!),
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
