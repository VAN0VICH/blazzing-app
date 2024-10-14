import type {
	CreatePrices,
	DeletePrices,
	UpdatePrice,
} from "@blazzing-app/validators";
import type { Price, Variant } from "@blazzing-app/validators/client";
import type { WriteTransaction } from "replicache";

export function entityNotFound(id: string) {
	console.info(`Entity ${id} not found`);
	throw new Error(`Entity ${id} not found`);
}

async function createPrices(tx: WriteTransaction, input: CreatePrices) {
	const { prices, id } = input;

	const entity = (await tx.get(id)) as Variant | undefined;

	if (!entity) {
		return entityNotFound(id);
	}
	const entityPrices = entity.prices ? [...entity.prices] : [];

	for (const price of prices) {
		entityPrices.push(price as Price);
	}

	await tx.set(id, {
		...entity,
		prices: entityPrices,
	});
}

async function updatePrice(tx: WriteTransaction, input: UpdatePrice) {
	const { priceID, updates, id } = input;

	const entity = (await tx.get(id)) as Variant | undefined;

	if (!entity) {
		return entityNotFound(id);
	}

	const entityPrices = entity.prices
		? entity.prices.map((price) => {
				if (price.id === priceID) return { ...price, ...updates };

				return price;
			})
		: [];

	await tx.set(entity.id, {
		...entity,
		prices: entityPrices,
	});
}

async function deletePrices(tx: WriteTransaction, input: DeletePrices) {
	const { priceIDs, id } = input;

	const entity = (await tx.get(id)) as Variant | undefined;

	if (!entity) {
		return entityNotFound(id);
	}

	const entityPrices = entity.prices
		? entity.prices.filter((price) => !priceIDs.includes(price.id))
		: [];

	await tx.set(id, {
		...entity,
		prices: entityPrices,
	});
}
export { createPrices, deletePrices, updatePrice };
