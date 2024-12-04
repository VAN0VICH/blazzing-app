import { Effect } from "effect";

import { Database } from "@blazzing-app/shared";
import {
	CreateLineItemSchema,
	NeonDatabaseError,
	UpdateLineItemSchema,
	type StoreLineItem,
} from "@blazzing-app/validators";
import { z } from "zod";
import { TableMutator } from "../../context/table-mutator";
import { fn } from "../../util/fn";
import { cartSubtotal } from "../../util/get-line-item-price";
import { createCart } from "./carts";

const createLineItem = fn(CreateLineItemSchema, (input) =>
	Effect.gen(function* () {
		const tableMutator = yield* TableMutator;
		const { manager } = yield* Database;
		const { lineItem, newCartID } = input;
		const product = yield* Effect.tryPromise(() =>
			manager.query.products.findFirst({
				columns: {
					status: true,
				},
				where: (products, { eq }) => eq(products.id, lineItem.productID),
			}),
		).pipe(
			Effect.catchTags({
				UnknownException: () =>
					new NeonDatabaseError({
						message: "error getting product",
					}),
			}),
		);

		//TODO: create a toast for the client
		if (!product || product.status !== "published") {
			return yield* Effect.succeed({});
		}

		if (newCartID) {
			yield* createCart({
				cart: {
					id: newCartID,
					createdAt: new Date().toISOString(),
					//TODO: get country code
					countryCode: "BY",
					currencyCode: "BYN",
				},
			});
		}
		if (lineItem.orderID) {
			const order = yield* Effect.tryPromise(() =>
				manager.query.orders.findFirst({
					where: (orders, { eq }) => eq(orders.id, lineItem.orderID!),
					with: {
						items: {
							columns: {
								id: true,
								quantity: true,
							},
							with: {
								variant: {
									columns: {
										id: true,
									},
									with: {
										prices: true,
									},
								},
							},
						},
					},
				}),
			).pipe(
				Effect.catchTags({
					UnknownException: () =>
						new NeonDatabaseError({
							message: "Error getting order",
						}),
				}),
			);
			if (!order) return;

			const newItems = [...(order?.items ?? []), lineItem];

			const subtotal = yield* cartSubtotal(
				(newItems as StoreLineItem[]) ?? [],
				order,
			).pipe(Effect.orDie);
			yield* tableMutator.update(
				order.id,
				{ subtotal, total: subtotal },
				"orders",
			);
		}

		return yield* Effect.all(
			[
				tableMutator.set(lineItem, "lineItems"),
				lineItem.cartID
					? tableMutator.update(lineItem.cartID, {}, "carts")
					: Effect.succeed({}),
			],
			{ concurrency: 2 },
		);
	}),
);

const updateLineItem = fn(UpdateLineItemSchema, (input) =>
	Effect.gen(function* () {
		const tableMutator = yield* TableMutator;
		const { manager } = yield* Database;
		const { quantity, id } = input;
		const lineItem = yield* Effect.tryPromise(() =>
			manager.query.lineItems.findFirst({
				where: (items, { eq }) => eq(items.id, id),
			}),
		).pipe(
			Effect.catchTags({
				UnknownException: () =>
					new NeonDatabaseError({
						message: "error updating line item",
					}),
			}),
		);
		if (lineItem?.orderID) {
			const order = yield* Effect.tryPromise(() =>
				manager.query.orders.findFirst({
					where: (orders, { eq }) => eq(orders.id, lineItem.orderID!),
					with: {
						items: {
							columns: {
								id: true,
								quantity: true,
							},
							with: {
								variant: {
									columns: {
										id: true,
									},
									with: {
										prices: true,
									},
								},
							},
						},
					},
				}),
			).pipe(
				Effect.catchTags({
					UnknownException: () =>
						new NeonDatabaseError({
							message: "error getting order",
						}),
				}),
			);
			if (!order) return;

			const newItems = (order.items ?? []).map((item) => {
				if (item.id === id) return { ...item, quantity };
				return item;
			});

			const subtotal = yield* cartSubtotal(
				(newItems as StoreLineItem[]) ?? [],
				order,
			).pipe(Effect.orDie);
			yield* tableMutator.update(
				order.id,
				{ subtotal, total: subtotal },
				"orders",
			);
		}
		return yield* Effect.all(
			[
				tableMutator.update(id, { quantity }, "lineItems"),
				lineItem?.cartID
					? tableMutator.update(lineItem.cartID, {}, "carts")
					: Effect.succeed({}),
			],
			{ concurrency: 2 },
		);
	}),
);
const deleteLineItem = fn(
	z.object({ id: z.string(), orderID: z.string().optional() }),
	(input) =>
		Effect.gen(function* () {
			const tableMutator = yield* TableMutator;
			const { manager } = yield* Database;
			const { id } = input;

			const lineItem = yield* Effect.tryPromise(() =>
				manager.query.lineItems.findFirst({
					where: (items, { eq }) => eq(items.id, id),
				}),
			).pipe(
				Effect.catchTags({
					UnknownException: () =>
						new NeonDatabaseError({
							message: "Error getting line item",
						}),
				}),
			);
			if (lineItem?.orderID) {
				const order = yield* Effect.tryPromise(() =>
					manager.query.orders.findFirst({
						where: (orders, { eq }) => eq(orders.id, lineItem.orderID!),
						with: {
							items: {
								columns: {
									id: true,
									quantity: true,
								},
								with: {
									variant: {
										columns: {
											id: true,
										},
										with: {
											prices: true,
										},
									},
								},
							},
						},
					}),
				).pipe(
					Effect.catchTags({
						UnknownException: () =>
							new NeonDatabaseError({
								message: "Error getting order",
							}),
					}),
				);
				if (!order) return;

				const newItems = (order.items ?? []).filter((item) => item.id !== id);

				const subtotal = yield* cartSubtotal(
					(newItems as StoreLineItem[]) ?? [],
					order,
				).pipe(Effect.orDie);
				yield* tableMutator.update(
					order.id,
					{ subtotal, total: subtotal },
					"orders",
				);
			}
			yield* Effect.all(
				[
					tableMutator.delete(id, "lineItems"),
					lineItem?.cartID
						? tableMutator.update(lineItem.cartID, {}, "carts")
						: Effect.succeed({}),
				],
				{ concurrency: 2 },
			);
		}),
);
export { createLineItem, deleteLineItem, updateLineItem };
