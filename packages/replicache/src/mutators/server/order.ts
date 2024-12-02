import { CreateOrderSchema, UpdateOrderSchema } from "@blazzing-app/validators";
import { Effect } from "effect";
import { z } from "zod";
import { TableMutator } from "../../context/table-mutator";
import { fn } from "../../util/fn";
import { Cloudflare } from "@blazzing-app/shared";

const createOrder = fn(CreateOrderSchema, (input) =>
	Effect.gen(function* () {
		const tableMutator = yield* TableMutator;
		const { get, bindings } = yield* Cloudflare;
		const storeID = get("storeID");
		const { order } = input;
		const kvResult = yield* Effect.tryPromise(() =>
			bindings.KV.get(`order_display_id_${storeID}`),
		).pipe(Effect.orDie);
		const orderDisplayID = kvResult ? (JSON.parse(kvResult) as number) + 1 : 1;
		yield* Effect.tryPromise(() =>
			bindings.KV.put(
				`order_display_id_${storeID}`,
				JSON.stringify(orderDisplayID),
				{
					expirationTtl: 12 * 60 * 60, // 12 hours in seconds
				},
			),
		).pipe(Effect.orDie);

		yield* tableMutator.set(order, "orders");
	}),
);

const updateOrder = fn(UpdateOrderSchema, (input) =>
	Effect.gen(function* () {
		const tableMutator = yield* TableMutator;
		const { id, updates } = input;
		return yield* tableMutator.update(id, updates, "orders");
	}),
);

const deleteOrder = fn(
	z.object({
		keys: z.array(z.string()),
	}),
	(input) =>
		Effect.gen(function* () {
			const tableMutator = yield* TableMutator;
			const { keys } = input;

			return yield* tableMutator.delete(keys, "orders");
		}),
);

export { createOrder, deleteOrder, updateOrder };
