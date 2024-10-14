import { UpdateAddressSchema } from "@blazzing-app/validators";
import { Effect } from "effect";
import { TableMutator } from "../../context/table-mutator";
import { fn } from "../../util/fn";

const updateAddress = fn(UpdateAddressSchema, (input) =>
	Effect.gen(function* () {
		const tableMutator = yield* TableMutator;
		const { updates, id } = input;

		return yield* tableMutator.update(id, updates, "addresses");
	}),
);
export { updateAddress };
