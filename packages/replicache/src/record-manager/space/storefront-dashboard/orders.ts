import { AuthContext, Database } from "@blazzing-app/shared";
import {
	NeonDatabaseError,
	type RowsWTableName,
} from "@blazzing-app/validators";
import { Effect } from "effect";
import type { GetRowsWTableName } from "../types";
import { sql } from "drizzle-orm";

export const storefrontDashboardOrderCVD: GetRowsWTableName = ({
	fullRows,
}) => {
	return Effect.gen(function* () {
		const { authUser } = yield* AuthContext;
		const userID = authUser?.userID;
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
							columns: { id: true, name: true, image: true, version: true },
							with: {
								orders: {
									limit: 500,
									orderBy: (orders, { desc }) => [
										// Add CASE logic for prioritizing "completed" status
										sql`CASE 
              								WHEN ${orders.status} IN ('completed', 'cancelled') THEN 1 
             								ELSE 0 
            								END`,
										desc(orders.createdAt), // Then order by freshest date
									],
									with: {
										customer: true,
										items: {
											with: {
												variant: {
													with: {
														optionValues: {
															with: {
																optionValue: true,
															},
														},
														prices: true,
													},
												},
												product: {
													with: {
														baseVariant: true,
													},
												},
											},
										},
										shippingAddress: true,
										billingAddress: true,
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
								orders: {
									columns: {
										id: true,
										version: true,
									},
									with: {
										customer: {
											columns: {
												id: true,
												version: true,
												createdAt: true,
											},
										},
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
						message: "error getting storefront dashboard orders CVD",
					}),
			}),
		);

		yield* Effect.forEach(
			storeData ?? [],
			(store) => {
				return Effect.gen(function* () {
					yield* Effect.all(
						[
							Effect.sync(() => {
								const customers = store.orders.map((order) => {
									return order.customer;
								});

								rowsWTableName.push({
									tableName: "customers" as const,
									rows: customers.filter((c) => !!c),
								});
							}),

							Effect.sync(() =>
								rowsWTableName.push({
									tableName: "orders" as const,
									rows: store.orders,
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
