import { CreateOrderSchema } from "@blazzing-app/validators";
import { Effect } from "effect";
import { fn } from "../../util/fn";
import { TableMutator } from "../../context/table-mutator";

const createOrder = fn(CreateOrderSchema, (input) =>
	Effect.gen(function* () {
		const tableMutator = yield* TableMutator;
		const { order } = input;
		return yield* tableMutator.set(order, "orders");
	}),
);
export { createOrder };
