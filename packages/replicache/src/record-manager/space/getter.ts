import {
	NeonDatabaseError,
	type SpaceID,
	type SpaceRecord,
} from "@blazzing-app/validators";

import { storeCVD } from "./dashboard";
import { userCVD } from "./global/user";
import type { GetRowsWTableName } from "./types";
import { cartCVD } from "./global/cart";
import { cartCVD as storefrontCartCVD } from "./storefront/cart";
import { ordersCVD } from "./global/orders";
import { tableNameToTableMap, type TableName } from "@blazzing-app/db";
import { Effect, pipe } from "effect";
import { generateRandomWithBias } from "@blazzing-app/utils";
import { Database } from "@blazzing-app/shared";
import { inArray } from "drizzle-orm";
import { notificationsCVD } from "./global/notifications";
import { storesCVD } from "./marketplace/stores";
import { paymentCVD } from "./global/payment";
import { productsAndVariantsCVD } from "./storefront/products";

export type SpaceRecordGetterType = {
	[K in SpaceID]: Record<SpaceRecord[K][number], GetRowsWTableName>;
};
export const SpaceRecordGetter: SpaceRecordGetterType = {
	dashboard: {
		store: storeCVD,
	},
	global: {
		user: userCVD,
		cart: cartCVD,
		orders: ordersCVD,
		notifications: notificationsCVD,
		payment: paymentCVD,
	},
	marketplace: {
		stores: storesCVD,
	},

	storefront: {
		cart: storefrontCartCVD,
		products: productsAndVariantsCVD,
	},
};
export const fullRowsGetter = (tableName: TableName, keys: string[]) =>
	Effect.gen(function* () {
		const { manager } = yield* Database;
		if (tableName === "products") {
			const products = yield* pipe(
				Effect.tryPromise(() =>
					manager.query.products.findMany({
						where: (products, { inArray }) => inArray(products.id, keys),
						with: {
							options: {
								with: {
									optionValues: true,
								},
							},
							baseVariant: {
								with: {
									prices: true,
									product: {
										with: {
											options: {
												with: {
													optionValues: true,
												},
											},
											baseVariant: true,
											store: true,
										},
									},
								},
							},
							store: true,
						},
					}),
				),
				Effect.catchTags({
					UnknownException: (error) =>
						new NeonDatabaseError({ message: error.message }),
				}),
			);

			return products.map((product) => {
				product.score = generateRandomWithBias(1, 4, 1, 10);
				return product;
			});
		}
		if (tableName === "stores") {
			return yield* pipe(
				Effect.tryPromise(() =>
					manager.query.stores.findMany({
						where: (stores, { inArray }) => inArray(stores.id, keys),
						with: {
							owner: true,
							paymentProfiles: {
								with: {
									paymentProfile: {
										with: {
											stripe: {
												columns: {
													id: true,
												},
											},
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
											prices: true,
										},
									},
									baseVariant: {
										with: {
											prices: true,
										},
									},
									options: {
										with: {
											optionValues: true,
										},
									},
									store: true,
								},
							},
						},
					}),
				),
				Effect.catchTags({
					UnknownException: (error) =>
						new NeonDatabaseError({ message: error.message }),
				}),
			);
		}
		if (tableName === "paymentProfiles") {
			return yield* pipe(
				Effect.tryPromise(() =>
					manager.query.paymentProfiles.findMany({
						where: (profile, { inArray }) => inArray(profile.id, keys),
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
		}
		if (tableName === "variants") {
			return yield* pipe(
				Effect.tryPromise(() =>
					manager.query.variants.findMany({
						where: (products, { inArray }) => inArray(products.id, keys),
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
									store: true,
									baseVariant: true,
								},
							},
							prices: true,
						},
					}),
				),

				Effect.catchTags({
					UnknownException: (error) =>
						new NeonDatabaseError({ message: error.message }),
				}),
			);
		}

		if (tableName === "carts") {
			return yield* pipe(
				Effect.tryPromise(() =>
					manager.query.carts.findMany({
						where: (carts, { inArray }) => inArray(carts.id, keys),
						with: {
							shippingAddress: true,
						},
					}),
				),
				Effect.catchTags({
					UnknownException: (error) =>
						new NeonDatabaseError({ message: error.message }),
				}),
			);
		}
		if (tableName === "lineItems") {
			return yield* pipe(
				Effect.tryPromise(() =>
					manager.query.lineItems.findMany({
						where: (items, { inArray }) => inArray(items.id, keys),
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
					}),
				),

				Effect.catchTags({
					UnknownException: (error) =>
						new NeonDatabaseError({ message: error.message }),
				}),
			);
		}
		if (tableName === "customers") {
			return yield* pipe(
				Effect.tryPromise(() =>
					manager.query.customers.findMany({
						where: (items, { inArray }) => inArray(items.id, keys),
						with: {
							user: {
								columns: {
									avatar: true,
									username: true,
								},
							},
						},
					}),
				),

				Effect.catchTags({
					UnknownException: (error) =>
						new NeonDatabaseError({ message: error.message }),
				}),
			);
		}
		if (tableName === "orders") {
			return yield* pipe(
				Effect.tryPromise(() =>
					manager.query.orders.findMany({
						where: (orders, { inArray }) => inArray(orders.id, keys),
						with: {
							customer: {
								with: {
									user: true,
								},
							},
							store: {
								columns: {
									id: true,
									image: true,
									name: true,
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
					}),
				),
				Effect.catchTags({
					UnknownException: (error) =>
						new NeonDatabaseError({ message: error.message }),
				}),
			);
		}
		const table = tableNameToTableMap[tableName];

		return yield* pipe(
			Effect.tryPromise(() =>
				manager.select().from(table).where(inArray(table.id, keys)),
			),
			Effect.catchTags({
				UnknownException: (error) =>
					new NeonDatabaseError({ message: error.message }),
			}),
		);
	});
