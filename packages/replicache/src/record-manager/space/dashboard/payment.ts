// import { Console, Effect, pipe } from "effect";

// import { AuthContext, Cloudflare, Database } from "@blazzing-app/shared";
// import {
// 	NeonDatabaseError,
// 	StripeAccountBalanceSchema,
// 	type RowsWTableName,
// } from "@blazzing-app/validators";
// import {
// 	HttpClient,
// 	HttpClientRequest,
// 	HttpClientResponse,
// } from "@effect/platform";
// import { Schema } from "@effect/schema";
// import type { GetRowsWTableName } from "../types";

// export const paymentCVD: GetRowsWTableName = ({ fullRows }) => {
// 	return Effect.gen(function* () {
// 		const { authUser } = yield* AuthContext;
// 		if (!authUser) return [];
// 		const { manager } = yield* Database;
// 		const { bindings } = yield* Cloudflare;
// 		const rowsWTableName: RowsWTableName[] = [];
// 		const paymentProfile = yield* pipe(
// 			Effect.tryPromise(() =>
// 				fullRows
// 					? manager.query.paymentProfiles.findFirst({
// 							where: (profile, { eq }) => eq(profile.authID, authUser.id),
// 							with: {
// 								stripe: true,
// 							},
// 						})
// 					: manager.query.paymentProfiles.findFirst({
// 							columns: {
// 								id: true,
// 								version: true,
// 							},
// 							where: (profile, { eq }) => eq(profile.authID, authUser.id),
// 							with: {
// 								stripe: true,
// 							},
// 						}),
// 			),
// 			Effect.catchTags({
// 				UnknownException: (error) =>
// 					new NeonDatabaseError({ message: error.message }),
// 			}),
// 		);
// 		yield* Console.log("paymentProfile <----", paymentProfile);
// 		yield* Console.log("url <----", `${bindings.WORKER_URL}/stripe/balance`);

// 		const balanceEffect = paymentProfile?.stripe?.id
// 			? pipe(
// 					HttpClientRequest.get(
// 						`${bindings.WORKER_URL}/stripe/balance/${paymentProfile.stripe.id}`,
// 					),
// 					Effect.flatMap(
// 						HttpClientResponse.schemaBodyJson(
// 							Schema.NullOr(StripeAccountBalanceSchema),
// 						),
// 					),
// 					Effect.scoped,
// 					Effect.catchAll((error) =>
// 						Effect.sync(() => {
// 							console.error(error);
// 							return null;
// 						}),
// 					),
// 				)
// 			: Effect.succeed(null);

// 		const [balance] = yield* Effect.all([balanceEffect], {
// 			concurrency: 1,
// 		});
// 		yield* Console.log("balance <----", balance);
// 		rowsWTableName.push({
// 			tableName: "paymentProfiles" as const,
// 			rows: paymentProfile
// 				? [
// 						{
// 							...paymentProfile,
// 							stripe: {
// 								...paymentProfile.stripe,
// 								...(balance && {
// 									balance: {
// 										available: balance.available.map((b) => ({
// 											amount: b.amount,
// 											currency: b.currency,
// 											sourceTypes: {
// 												card: b.source_types.card,
// 											},
// 										})),
// 										pending: balance.pending.map((b) => ({
// 											amount: b.amount,
// 											currency: b.currency,
// 											sourceTypes: {
// 												card: b.source_types.card,
// 											},
// 										})),
// 									},
// 								}),
// 							},
// 						},
// 					]
// 				: [],
// 		});
// 		return rowsWTableName;
// 	});
// };
