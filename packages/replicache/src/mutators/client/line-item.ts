import type { WriteTransaction } from "replicache";

import type { CreateLineItem, UpdateLineItem } from "@blazzing-app/validators";
import type { LineItem } from "@blazzing-app/validators/client";
import { createCart } from "./cart";

async function createLineItem(tx: WriteTransaction, input: CreateLineItem) {
	const { lineItem, newCartID } = input;
	if (newCartID) {
		await createCart(tx, {
			cart: {
				id: newCartID,
				createdAt: new Date().toISOString(),
				//TODO: get country code
				countryCode: "AU",
				currencyCode: "AUD",
			},
		});
	}
	await tx.set(lineItem.id, lineItem);
}

async function updateLineItem(tx: WriteTransaction, input: UpdateLineItem) {
	const { id, quantity } = input;
	const lineItem = await tx.get<LineItem>(id);

	if (!lineItem) {
		console.info("Line item  not found");
		throw new Error("Line item not found");
	}

	await tx.set(id, {
		...lineItem,
		quantity,
	});
}

async function deleteLineItem(tx: WriteTransaction, input: { id: string }) {
	const { id } = input;

	await tx.del(id);
}

export { createLineItem, deleteLineItem, updateLineItem };
