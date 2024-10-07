import { UpdateCartSchema } from "@blazzing-app/validators";
import { Effect } from "effect";
import { fn } from "../../util/fn";
import { TableMutator } from "../../context/table-mutator";

const updateCart = fn(UpdateCartSchema, (input) =>
	Effect.gen(function* () {
		const tableMutator = yield* TableMutator;
		const { updates, id } = input;

		return yield* tableMutator.update(id, updates, "carts");
	}),
);
export { updateCart };
