import { schema } from "@blazzing-app/db";
import { Cloudflare, Database } from "@blazzing-app/shared";
import { cartSubtotal, generateID } from "@blazzing-app/utils";
import {
	CartError,
	CheckoutFormSchema,
	NeonDatabaseError,
	type InsertOrder,
} from "@blazzing-app/validators";
import { eq, sql } from "drizzle-orm";
import { Console, Effect } from "effect";
import { z } from "zod";
import { fn } from "../util/fn";

export namespace CartService {
	export const completeCart = fn(
		z.object({ checkoutInfo: CheckoutFormSchema, id: z.string() }),
		({ checkoutInfo, id }) =>
			Effect.gen(function* () {
				const { manager } = yield* Database;
				const { env } = yield* Cloudflare;
				const orderIDs = yield* Effect.tryPromise(() =>
					manager.transaction(
						async (transaction) =>
							Effect.gen(function* () {
								const [cart, existingCustomer, existingUser] =
									yield* Effect.all(
										[
											Effect.tryPromise(() =>
												transaction.query.carts.findFirst({
													where: (carts, { eq }) => eq(carts.id, id),
													with: {
														items: {
															with: {
																variant: {
																	with: {
																		prices: true,
																	},
																},
															},
														},
													},
												}),
											),

											Effect.tryPromise(() =>
												transaction.query.customers.findFirst({
													where: (customers, { eq }) =>
														eq(customers.email, checkoutInfo.email),
													columns: {
														id: true,
													},
												}),
											),
											Effect.tryPromise(() =>
												transaction.query.users.findFirst({
													where: (users, { eq }) =>
														eq(users.email, checkoutInfo.email),
													columns: {
														id: true,
													},
												}),
											),
										],
										{ concurrency: 3 },
									);
								if (!cart) {
									return yield* Effect.fail(
										new CartError({ message: "Cart not found." }),
									);
								}
								if (!cart.items || cart.items.length === 0) {
									return yield* Effect.fail(
										new CartError({ message: "Cart is empty." }),
									);
								}

								const newCustomerID = generateID({ prefix: "customer" });
								const newUserID = generateID({ prefix: "user" });
								const newShippingAddressID = generateID({ prefix: "address" });

								/* create new user if not found */
								if (!existingCustomer) {
									yield* Effect.all([
										!existingCustomer
											? Effect.tryPromise(() =>
													transaction.insert(schema.customers).values({
														id: newCustomerID,
														createdAt: new Date().toISOString(),
														version: 0,
														email: checkoutInfo.email,
														userID: existingUser ? existingUser.id : newUserID,
													}),
												)
											: Effect.succeed({}),
										!existingUser
											? Effect.tryPromise(() =>
													transaction.insert(schema.users).values({
														id: newUserID,
														createdAt: new Date().toISOString(),
														version: 0,
														fullName: checkoutInfo.fullName,
														email: checkoutInfo.email,
													}),
												)
											: Effect.succeed({}),
									]);
								}

								/* create new address*/
								if (!cart.shippingAddressID) {
									yield* Effect.tryPromise(() =>
										transaction.insert(schema.addresses).values({
											id: newShippingAddressID,
											line1: checkoutInfo.shippingAddress.line1,
											line2: checkoutInfo.shippingAddress.line2,
											city: checkoutInfo.shippingAddress.city,
											countryCode: checkoutInfo.shippingAddress.countryCode,
											postalCode: checkoutInfo.shippingAddress.postalCode,
											state: checkoutInfo.shippingAddress.state,
											version: 0,
											createdAt: new Date().toISOString(),
											userID: existingUser ? existingUser.id : newUserID,
										}),
									);
								}

								/* items can be from many stores. Map them */
								const storeIDToLineItem = new Map<string, typeof cart.items>();
								yield* Effect.forEach(cart.items ?? [], (lineItem) =>
									Effect.sync(() => {
										const storeID = lineItem.storeID;
										const lineItems = storeIDToLineItem.get(storeID) ?? [];
										lineItems.push(lineItem);
										storeIDToLineItem.set(storeID, lineItems);
									}),
								);

								const storeIDToOrder = new Map<string, InsertOrder>();

								/* Create an order for each store. */
								yield* Effect.forEach(
									storeIDToLineItem.entries(),
									([storeID, lineItems]) =>
										Effect.gen(function* () {
											//TODO: DO ACTUAL MATH ON TOTAL AND SUBTOTAL
											const subtotal = yield* cartSubtotal(lineItems, cart);
											const newOrder: InsertOrder = {
												id: generateID({ prefix: "order" }),
												countryCode: cart.countryCode ?? "AU",
												currencyCode: "AUD",
												createdAt: new Date().toISOString(),
												email: checkoutInfo.email ?? "email not provided",
												//TODO
												billingAddressID:
													cart.shippingAddressID ?? newShippingAddressID,
												shippingAddressID:
													cart.shippingAddressID ?? newShippingAddressID,
												phone: checkoutInfo.phone,
												fullName: checkoutInfo.fullName,
												customerID: existingCustomer
													? existingCustomer.id
													: newCustomerID,
												storeID,
												total: subtotal,
												status: "pending",
											};
											storeIDToOrder.set(storeID, newOrder);
										}),
								);

								/* Get order IDs a. */
								const orderIDs = yield* Effect.tryPromise(() =>
									transaction
										.insert(schema.orders)
										//@ts-ignore
										.values(Array.from(storeIDToOrder.values()))
										.returning({ id: schema.orders.id }),
								);
								yield* Effect.all([
									/* for each line item, update the orderID, so that order will include those items */
									/* for each line item, remove the cartID, so that cart will not include items that were successfully ordered */
									Effect.forEach(
										Array.from(storeIDToLineItem.entries()),
										([storeID, items]) =>
											Effect.gen(function* () {
												const effect = Effect.forEach(
													items,
													(item) => {
														return Effect.tryPromise(() =>
															transaction
																.update(schema.lineItems)
																.set({
																	cartID: null,
																	orderID: storeIDToOrder.get(storeID)!.id,
																})
																.where(eq(schema.lineItems.id, item.id)),
														);
													},
													{ concurrency: "unbounded" },
												);
												return yield* effect;
											}),
										{ concurrency: "unbounded" },
									),

									/* save user info for the cart */
									Effect.tryPromise(() =>
										transaction
											.update(schema.carts)
											.set({
												fullName: cart.fullName,
												email: cart.email,
												phone: cart.phone,
												version: sql`${schema.carts.version} + 1`,
												userID: existingUser ? existingUser.id : newUserID,
												...(!cart.shippingAddressID && {
													shippingAddressID: newShippingAddressID,
												}),
											})

											.where(eq(schema.carts.id, id)),
									),

									Effect.tryPromise(() =>
										transaction.insert(schema.notifications).values([
											{
												id: generateID({ prefix: "notification" }),
												createdAt: new Date().toISOString(),
												type: "ORDER_PLACED" as const,
												entityID: existingUser ? existingUser.id : newUserID,
												description: "Order has been placed",
												title: "Order Placed",
											},
											...Array.from(storeIDToOrder.keys()).map((storeID) => ({
												id: generateID({ prefix: "notification" }),
												createdAt: new Date().toISOString(),
												type: "ORDER_PLACED" as const,
												entityID: storeID,
												description: "Order has been placed",
												title: "Order Placed",
											})),
										]),
									),
								]);
								return orderIDs.map((order) => order.id);
							}).pipe(
								Effect.catchTags({
									UnknownException: (error) =>
										new NeonDatabaseError({ message: error.message }),
								}),
							),
						{ accessMode: "read write", isolationLevel: "read committed" },
					),
				).pipe(
					Effect.flatMap((result) => result),
					Effect.withSpan("complete-cart"),
					Effect.catchTags({
						UnknownException: (error) =>
							Effect.gen(function* () {
								yield* Console.error(
									"Unknown blyat",
									error.message,
									error.toString(),
								);
								return [] as string[];
							}),
						CartError: (error) =>
							Effect.gen(function* () {
								yield* Console.error(
									"Cart error",
									error.message,
									error.toString(),
								);

								return [] as string[];
							}),
						PriceNotFound: (error) =>
							Effect.gen(function* () {
								yield* Console.error(
									"Price not found",
									error.message,
									error.toString(),
								);

								return [] as string[];
							}),
					}),

					Effect.retry({ times: 2 }),
					Effect.zipLeft(
						Effect.all([
							Effect.tryPromise(() =>
								fetch(`${env.PARTYKIT_ORIGIN}/parties/main/dashboard`, {
									method: "POST",
									body: JSON.stringify(["store"]),
								}),
							),
							Effect.tryPromise(() =>
								fetch(`${env.PARTYKIT_ORIGIN}/parties/main/global`, {
									method: "POST",
									body: JSON.stringify(["user"]),
								}),
							),
						]),
					),

					Effect.orDie,
				);

				if (!orderIDs) return [];

				return orderIDs;
			}),
	);
}
