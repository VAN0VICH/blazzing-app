import { Effect } from "effect";

import { AuthContext, Database } from "@blazzing-app/shared";
import {
	NeonDatabaseError,
	type RowsWTableName,
} from "@blazzing-app/validators";
import type { GetRowsWTableName } from "../types";

export const storeCVD: GetRowsWTableName = ({ fullRows }) => {
	return Effect.gen(function* () {
		const { authUser } = yield* AuthContext;
		const user = authUser
			? yield* Effect.tryPromise(() =>
					manager.query.users
						.findFirst({
							where: (users, { eq }) => eq(users.authID, authUser.id),
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
								message: "error getting user:store-dashboard:store",
							}),
					}),
				)
			: undefined;
		const userID = user?.id;
		if (!userID) return [];
		const { manager } = yield* Database;
		const rowsWTableName: RowsWTableName[] = [];

		const storesIDs = (yield* Effect.tryPromise(() =>
			manager.query.adminsToStores.findMany({
				where: (stores, { eq }) => eq(stores.userID, userID),
			}),
		).pipe(
			Effect.catchTags({
				UnknownException: () =>
					new NeonDatabaseError({ message: "error getting store ids" }),
			}),
		)).map((s) => s.storeID);
		const storeData = yield* Effect.tryPromise(() =>
			fullRows
				? manager.query.stores
						.findMany({
							where: (stores, { inArray }) => inArray(stores.id, storesIDs),
							columns: {
								id: true,
								version: true,
							},
							with: {
								products: {
									with: {
										variants: {
											with: {
												optionValues: {
													with: {
														optionValue: {
															with: {
																option: true,
															},
														},
													},
												},

												product: true,
												prices: true,
											},
										},
										options: {
											with: {
												optionValues: true,
											},
										},
										baseVariant: {
											with: {
												optionValues: {
													with: {
														optionValue: {
															with: {
																option: true,
															},
														},
													},
												},

												product: {
													with: {
														options: {
															with: {
																optionValues: true,
															},
														},
													},
												},
												prices: true,
											},
										},
									},
								},
							},
						})
						.catch((e) => {
							console.log(e);
							throw new Error("Error");
						})
				: manager.query.stores
						.findMany({
							where: (stores, { inArray }) => inArray(stores.id, storesIDs),
							columns: {
								id: true,
								version: true,
							},
							with: {
								products: {
									columns: {
										id: true,
										version: true,
									},
									with: {
										variants: {
											columns: {
												id: true,
												version: true,
											},
										},
										baseVariant: true,
									},
								},
							},
						})
						.catch((e) => {
							console.log(e);
							throw new Error("Error");
						}),
		).pipe(
			Effect.catchTags({
				UnknownException: () =>
					new NeonDatabaseError({
						message: "error getting store CVD in storefront",
					}),
			}),
		);

		yield* Effect.forEach(
			storeData ?? [],
			(store) => {
				return Effect.gen(function* () {
					yield* Effect.all(
						[
							Effect.sync(() =>
								rowsWTableName.push({
									tableName: "products" as const,
									rows: store.products,
								}),
							),
							Effect.sync(() =>
								rowsWTableName.push({
									tableName: "stores" as const,
									rows: [{ ...store, products: undefined }],
								}),
							),
						],
						{ concurrency: 2 },
					);
				});
			},
			{ concurrency: "unbounded" },
		);

		return rowsWTableName;
	});
};
