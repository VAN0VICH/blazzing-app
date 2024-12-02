import { Effect, pipe } from "effect";

import { AuthContext, Database } from "@blazzing-app/shared";
import {
	NeonDatabaseError,
	type RowsWTableName,
} from "@blazzing-app/validators";
import type { GetRowsWTableName } from "../types";

export const storeCVD: GetRowsWTableName = ({ fullRows }) => {
	return Effect.gen(function* () {
		const { authUser } = yield* AuthContext;
		if (!authUser) return [];
		const { manager } = yield* Database;
		const rowsWTableName: RowsWTableName[] = [];
		const activeStoreIDEffect = pipe(
			Effect.tryPromise(() =>
				fullRows
					? manager.query.jsonTable.findFirst({
							where: (jsonTable, { eq }) =>
								eq(jsonTable.id, `active_store_id_${authUser.id}`),
						})
					: manager.query.jsonTable.findFirst({
							where: (jsonTable, { eq }) =>
								eq(jsonTable.id, `active_store_id_${authUser.id}`),
							columns: {
								id: true,
								version: true,
							},
						}),
			),
			Effect.catchTags({
				UnknownException: (error) =>
					new NeonDatabaseError({ message: error.message }),
			}),
		);

		const storeDataEffect = Effect.tryPromise(() =>
			fullRows
				? manager.query.users.findFirst({
						where: (user, { eq }) => eq(user.authID, authUser.id),
						with: {
							stores: {
								with: {
									admins: {
										with: {
											admin: {
												columns: {
													email: true,
												},
											},
										},
									},
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

													product: {
														with: {
															baseVariant: true,
															options: {
																with: {
																	optionValues: true,
																},
															},
															store: true,
														},
													},
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
											store: true,
										},
									},
									owner: true,
									orders: {
										with: {
											customer: {
												with: {
													user: {
														columns: {
															avatar: true,
															username: true,
														},
													},
												},
											},
											items: {
												with: {
													variant: {
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
															prices: true,
														},
													},
													product: {
														with: {
															options: {
																with: {
																	optionValues: true,
																},
															},
															store: true,
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
							},
						},
					})
				: manager.query.users.findFirst({
						where: (users, { eq }) => eq(users.authID, authUser.id),
						with: {
							stores: {
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
							},
						},
					}),
		).pipe(
			Effect.catchTags({
				UnknownException: (error) =>
					new NeonDatabaseError({ message: error.message }),
			}),
		);
		const [activeStoreID, storeData] = yield* Effect.all(
			[activeStoreIDEffect, storeDataEffect],
			{ concurrency: 2 },
		);

		yield* Effect.sync(() =>
			rowsWTableName.push({
				tableName: "json" as const,
				rows: activeStoreID ? [activeStoreID] : [],
			}),
		);

		yield* Effect.forEach(
			storeData?.stores ?? [],
			(store) => {
				return Effect.gen(function* () {
					yield* Effect.all(
						[
							Effect.sync(() =>
								rowsWTableName.push({
									tableName: "stores" as const,
									rows: [{ ...store, products: undefined }],
								}),
							),

							//push variants before products, as products.variants = [] modifies variants property
							Effect.sync(() =>
								rowsWTableName.push({
									tableName: "variants" as const,
									rows: store.products.flatMap((value) =>
										value.variants.flatMap((v) => ({
											...v,
											prices: v,
										})),
									),
								}),
							),
							Effect.sync(() =>
								rowsWTableName.push({
									tableName: "products" as const,
									rows: store.products.map((product) => {
										product.variants = [];
										return product;
									}),
								}),
							),

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
						{ concurrency: 5 },
					);
				});
			},
			{ concurrency: "unbounded" },
		);

		return rowsWTableName;
	});
};
