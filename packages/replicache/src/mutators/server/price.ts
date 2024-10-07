import {
	CreatePricesSchema,
	DeletePricesSchema,
	UpdatePriceSchema,
} from "@blazzing-app/validators";
import { Effect } from "effect";
import { fn } from "../../util/fn";
import { TableMutator } from "../../context/table-mutator";

const createPrices = fn(CreatePricesSchema, (input) =>
	Effect.gen(function* () {
		const tableMutator = yield* TableMutator;
		const { prices, id } = input;
		const isVariant =
			id.startsWith("variant") || id.startsWith("variant_default");
		const effects = [];
		effects.push(tableMutator.set(prices, "prices"));

		if (isVariant) effects.push(tableMutator.update(id, {}, "variants"));

		return yield* Effect.all(effects, {
			concurrency: 2,
		});
	}),
);

const updatePrice = fn(UpdatePriceSchema, (input) =>
	Effect.gen(function* (_) {
		const tableMutator = yield* TableMutator;
		const { priceID, updates, id } = input;

		const isVariant =
			id.startsWith("variant") || id.startsWith("variant_default");

		const effects = [tableMutator.update(priceID, updates, "prices")];

		if (isVariant) effects.push(tableMutator.update(id, {}, "variants"));

		return yield* Effect.all(effects, {
			concurrency: 2,
		});
	}),
);

const deletePrices = fn(DeletePricesSchema, (input) =>
	Effect.gen(function* () {
		const tableMutator = yield* TableMutator;
		const { priceIDs, id } = input;

		const isVariant =
			id.startsWith("variant") || id.startsWith("variant_default");

		const effects = [tableMutator.delete(priceIDs, "prices")];
		if (isVariant) effects.push(tableMutator.update(id, {}, "variants"));

		return yield* Effect.all(effects, {
			concurrency: 2,
		});
	}),
);
export { createPrices, updatePrice, deletePrices };
