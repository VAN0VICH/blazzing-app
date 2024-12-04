import { AuthContext, Cloudflare, Database } from "@blazzing-app/shared";
import {
	NeonDatabaseError,
	type RowsWTableName,
} from "@blazzing-app/validators";
import { Effect } from "effect";
import type { GetRowsWTableName } from "../types";

export const storefrontOrderCVD: GetRowsWTableName = ({ fullRows }) => {
	return Effect.gen(function* () {
		const { authUser } = yield* AuthContext;
		const { get } = yield* Cloudflare;
		const { manager } = yield* Database;
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
								message: "error getting user:storefront:orders",
							}),
					}),
				)
			: undefined;
		const userID = user?.id;
		const tempUserID = get("temp-user-id");
		const rowsWTableName: RowsWTableName[] = [];

		const orderData = yield* Effect.tryPromise(() =>
			fullRows
				? manager.query.orders
						.findMany({
							where: (orders, { eq }) =>
								userID
									? eq(orders.customerID, userID)
									: eq(orders.tempUserID, tempUserID),
							orderBy: (orders, { desc }) => [
								desc(orders.createdAt), // Then order by freshest date
							],
							with: {
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
						})
						.catch((e) => {
							console.log(e);
							throw new Error("Error");
						})
				: manager.query.orders
						.findMany({
							where: (orders, { eq }) =>
								userID
									? eq(orders.customerID, userID)
									: eq(orders.tempUserID, tempUserID),
							columns: {
								id: true,
								version: true,
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
						message: "error getting storefront orders CVD",
					}),
			}),
		);

		yield* Effect.sync(() =>
			rowsWTableName.push({
				tableName: "orders" as const,
				rows: orderData,
			}),
		);

		return rowsWTableName;
	});
};
