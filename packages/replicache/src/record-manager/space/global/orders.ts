import { Console, Effect, pipe } from "effect";

import { AuthContext, Cloudflare, Database } from "@blazzing-app/shared";
import { NeonDatabaseError, NotFound } from "@blazzing-app/validators";
import type { GetRowsWTableName } from "../types";

export const ordersCVD: GetRowsWTableName = ({ fullRows }) => {
	return Effect.gen(function* () {
		const { authUser } = yield* AuthContext;
		const { request } = yield* Cloudflare;
		const tempUserID = request.headers.get("x-temp-user-id");
		const { manager } = yield* Database;

		const ordersCVD = authUser
			? yield* pipe(
					Effect.tryPromise(() =>
						manager.query.users.findFirst({
							where: (users, { eq }) => eq(users.authID, authUser.id),
							columns: {
								email: true,
								phone: true,
							},
						}),
					),
					Effect.flatMap((user) =>
						Effect.gen(function* () {
							if (!user)
								return yield* Effect.fail(
									new NotFound({ message: "User not found" }),
								);
							return yield* Effect.succeed({
								email: user.email,
								phone: user.phone,
							});
						}),
					),
					Effect.flatMap(({ email, phone }) =>
						Effect.tryPromise(() =>
							fullRows
								? manager.query.orders.findMany({
										where: (orders, { eq, or }) =>
											or(
												eq(orders.email, email ?? "no email"),
												eq(orders.phone, phone ?? "no phone"),
											),
										with: {
											shippingAddress: true,
											billingAddress: true,
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
										},
									})
								: manager.query.orders.findMany({
										columns: {
											id: true,
											version: true,
										},
										where: (orders, { eq, or }) =>
											or(
												eq(orders.email, email ?? "no email"),
												eq(orders.phone, phone ?? "no phone"),
											),
										with: {
											items: {
												columns: {
													id: true,
													version: true,
												},
											},
										},
									}),
						),
					),
					Effect.map((orders) => [
						{
							tableName: "orders" as const,
							rows: orders,
						},
					]),
					Effect.catchTags({
						UnknownException: (error) =>
							new NeonDatabaseError({ message: error.message }),
						NotFound: () => Effect.succeed([]),
					}),
				)
			: tempUserID
				? yield* pipe(
						Effect.tryPromise(() =>
							fullRows
								? manager.query.orders.findMany({
										where: (orders, { eq }) =>
											eq(orders.tempUserID, tempUserID),
										with: {
											shippingAddress: true,
											billingAddress: true,
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
										},
									})
								: manager.query.orders.findMany({
										columns: {
											id: true,
											version: true,
										},
										where: (orders, { eq }) =>
											eq(orders.tempUserID, tempUserID),
										with: {
											items: {
												columns: {
													id: true,
													version: true,
												},
											},
										},
									}),
						),
						Effect.map((orders) => [
							{
								tableName: "orders" as const,
								rows: orders,
							},
						]),
						Effect.catchTags({
							UnknownException: (error) =>
								new NeonDatabaseError({ message: error.message }),
						}),
					)
				: yield* Effect.succeed([]);
		return ordersCVD;
	});
};
