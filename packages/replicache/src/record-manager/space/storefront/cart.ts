import { Effect, pipe } from "effect";

import type { GetRowsWTableName } from "../types";
import { Cloudflare, Database } from "@blazzing-app/shared";
import { NeonDatabaseError } from "@blazzing-app/validators";

export const cartCVD: GetRowsWTableName = ({ fullRows }) => {
	return Effect.gen(function* () {
		const { request } = yield* Cloudflare;
		const cartID = request.headers.get("x-cart-id");
		if (!cartID) return [];
		const { manager } = yield* Database;
		const cvd = yield* pipe(
			Effect.tryPromise(() =>
				fullRows
					? manager.query.carts.findFirst({
							where: (carts, { eq }) => eq(carts.id, cartID),
							with: {
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
										product: true,
									},
								},
								shippingAddress: true,
							},
						})
					: manager.query.carts.findFirst({
							columns: {
								id: true,
								version: true,
							},
							where: (carts, { eq }) => eq(carts.id, cartID),
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
			Effect.map((cart) => [
				{ tableName: "lineItems" as const, rows: cart?.items ?? [] },
				{
					tableName: "carts" as const,
					rows: cart ? [{ ...cart, items: [] }] : [],
				},
			]),
			Effect.catchTags({
				UnknownException: (error) =>
					new NeonDatabaseError({ message: error.message }),
			}),
		);

		return cvd;
	});
};
