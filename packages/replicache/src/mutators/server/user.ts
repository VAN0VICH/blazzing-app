import { UpdateUserSchema } from "@blazzing-app/validators";
import { Effect } from "effect";
import { TableMutator } from "../../context/table-mutator";
import { fn } from "../../util/fn";

const updateUser = fn(UpdateUserSchema, (input) =>
	Effect.gen(function* () {
		const { updates, id } = input;
		const tableMutator = yield* TableMutator;

		return yield* tableMutator.update(id, { ...updates }, "users");
	}),
);

export { updateUser };
