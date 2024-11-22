import { Console, Effect } from "effect";

import { Cloudflare, Database } from "@blazzing-app/shared";
import {
	NeonDatabaseError,
	type RowsWTableName,
} from "@blazzing-app/validators";
import type { GetRowsWTableName } from "../types";

export const productsAndVariantsCVD: GetRowsWTableName = ({ fullRows }) => {
	return Effect.gen(function* () {
		const rowsWTableName: RowsWTableName[] = [];
		const { manager } = yield* Database;
		const { get } = yield* Cloudflare;
		const storeID = get("storeID");
		if (!storeID) {
			yield* Console.warn("No store ID provided");
			return [];
		}
		const storeCVD = yield* Effect.tryPromise(() =>
			fullRows
				? manager.query.stores.findFirst({
						where: (stores, { eq }) => eq(stores.id, storeID),
						with: {
							products: {
								where: (products, { eq }) => eq(products.status, "published"),
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
									},
									baseVariant: {
										with: {
											prices: true,
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
													baseVariant: true,
													store: true,
												},
											},
										},
									},
									options: {
										with: {
											optionValues: true,
										},
									},
								},
							},
						},
					})
				: manager.query.stores.findFirst({
						where: (stores, { eq }) => eq(stores.id, storeID),
						columns: {
							id: true,
							version: true,
						},
						with: {
							products: {
								where: (products, { eq }) => eq(products.status, "published"),
								columns: {
									id: true,
									version: true,
									score: true,
								},
								with: {
									variants: {
										columns: { id: true, version: true },
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

		yield* Effect.all(
			[
				//push variants before products, as products.variants = [] modifies variants property
				Effect.sync(() =>
					rowsWTableName.push({
						tableName: "variants" as const,
						rows: !storeCVD
							? []
							: storeCVD.products.flatMap((product) => product.variants),
					}),
				),
				Effect.sync(() =>
					rowsWTableName.push({
						tableName: "products" as const,
						rows: storeCVD?.products ?? [],
					}),
				),
			],
			{ concurrency: 2 },
		);
		yield* Effect.log(`PRODUCTS CVD ${JSON.stringify(rowsWTableName)}`);

		return rowsWTableName;
	});
};
