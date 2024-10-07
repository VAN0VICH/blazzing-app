import { Effect } from "effect";

import { CreateCartSchema } from "@blazzing-app/validators";
import { TableMutator } from "../../context/table-mutator";
import { fn } from "../../util/fn";

const createCart = fn(CreateCartSchema, (input) =>
	Effect.gen(function* () {
		const tableMutator = yield* TableMutator;
		const { cart } = input;
		return yield* tableMutator.set(cart, "carts");
	}),
);

export { createCart };
