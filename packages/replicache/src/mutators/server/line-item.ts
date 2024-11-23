import { Effect } from "effect";

import {
	CreateLineItemSchema,
	NeonDatabaseError,
	UpdateLineItemSchema,
} from "@blazzing-app/validators";
import { z } from "zod";
import { fn } from "../../util/fn";
import { TableMutator } from "../../context/table-mutator";
import { createCart } from "./carts";
import { Database } from "@blazzing-app/shared";

const createLineItem = fn(CreateLineItemSchema, (input) =>
	Effect.gen(function* () {
		const tableMutator = yield* TableMutator;
		const { manager } = yield* Database;
		const { lineItem, newCartID } = input;
		const product = yield* Effect.tryPromise(() =>
			manager.query.products.findFirst({
				where: (products, { eq }) => eq(products.id, lineItem.productID),
			}),
		).pipe(
			Effect.catchTags({
				UnknownException: (error) =>
					new NeonDatabaseError({
						message: error.message,
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
		return yield* tableMutator.set(lineItem, "lineItems");
	}),
);

const updateLineItem = fn(UpdateLineItemSchema, (input) =>
	Effect.gen(function* () {
		const tableMutator = yield* TableMutator;
		const { quantity, id } = input;
		return yield* tableMutator.update(id, { quantity }, "lineItems");
	}),
);
const deleteLineItem = fn(z.object({ id: z.string() }), (input) =>
	Effect.gen(function* () {
		const tableMutator = yield* TableMutator;
		const { id } = input;
		return yield* tableMutator.delete(id, "lineItems");
	}),
);
export { createLineItem, updateLineItem, deleteLineItem };
