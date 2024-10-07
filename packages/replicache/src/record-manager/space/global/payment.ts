import { Console, Effect, pipe } from "effect";

import { AuthContext, Database } from "@blazzing-app/shared";
import {
	NeonDatabaseError,
	type RowsWTableName,
} from "@blazzing-app/validators";
import type { GetRowsWTableName } from "../types";

export const paymentCVD: GetRowsWTableName = ({ fullRows }) => {
	return Effect.gen(function* () {
		const { authUser } = yield* AuthContext;
		if (!authUser) return [];
		const { manager } = yield* Database;
		const rowsWTableName: RowsWTableName[] = [];
		const paymentProfile = yield* pipe(
			Effect.tryPromise(() =>
				fullRows
					? manager.query.paymentProfiles.findFirst({
							where: (profile, { eq }) => eq(profile.authID, authUser.id),
							with: {
								stripe: true,
							},
						})
					: manager.query.paymentProfiles.findFirst({
							columns: {
								id: true,
								version: true,
							},
							where: (profile, { eq }) => eq(profile.authID, authUser.id),
							with: {
								stripe: true,
							},
						}),
			),
			Effect.catchTags({
				UnknownException: (error) =>
					new NeonDatabaseError({ message: error.message }),
			}),
		);
		yield* Console.log("paymentProfile <----", paymentProfile);

		rowsWTableName.push({
			tableName: "paymentProfiles" as const,
			rows: paymentProfile
				? [
						paymentProfile,
						// {
						// ...paymentProfile,
						// stripe: {
						// ...paymentProfile.stripe,
						// ...(balance && {
						// 	balance: {
						// 		available: balance.available.map((b) => ({
						// 			amount: b.amount,
						// 			currency: b.currency,
						// 			sourceTypes: {
						// 				card: b.source_types.card,
						// 			},
						// 		})),
						// 		pending: balance.pending.map((b) => ({
						// 			amount: b.amount,
						// 			currency: b.currency,
						// 			sourceTypes: {
						// 				card: b.source_types.card,
						// 			},
						// 		})),
						// 	},
						// }),
						// },
						// },
					]
				: [],
		});
		return rowsWTableName;
	});
};
