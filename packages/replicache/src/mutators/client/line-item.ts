import type { WriteTransaction } from "replicache";

import type {
	CreateLineItem,
	StoreLineItem,
	StoreOrder,
	UpdateLineItem,
} from "@blazzing-app/validators";
import { createCart } from "./cart";
import { cartSubtotal } from "../../util/get-line-item-price";
import { Effect } from "effect";

async function createLineItem(tx: WriteTransaction, input: CreateLineItem) {
	const { lineItem, newCartID } = input;
	if (newCartID) {
		await createCart(tx, {
			cart: {
				id: newCartID,
				createdAt: new Date().toISOString(),
				//TODO: get country code
				countryCode: "BY",
				currencyCode: "BYN",
			},
		});
	}
	if (lineItem.orderID) {
		const order = await tx.get<StoreOrder>(lineItem.orderID);
		if (!order) throw new Error("order not found");
		const newItems = [...(order.items ?? []), lineItem];
		const subtotal = Effect.runSync(
			cartSubtotal(newItems as StoreLineItem[], order),
		);
		return await tx.set(order.id, {
			...order,
			items: newItems,
			subtotal,
			total: subtotal,
		});
	}
	await tx.set(lineItem.id, lineItem);
}

async function updateLineItem(tx: WriteTransaction, input: UpdateLineItem) {
	const { id, quantity, orderID } = input;

	if (orderID) {
		const order = await tx.get<StoreOrder>(orderID);
		if (!order) throw new Error("order not found");
		const newItems = (order.items ?? []).map((item) => {
			if (item.id === id) return { ...item, quantity };
			return item;
		});
		const subtotal = Effect.runSync(
			cartSubtotal(newItems as StoreLineItem[], order),
		);
		return await tx.set(order.id, {
			...order,
			items: newItems,
			subtotal,
			total: subtotal,
		});
	}
	const lineItem = await tx.get<StoreLineItem>(id);
	if (!lineItem) {
		console.info("Line item  not found");
		throw new Error("Line item not found");
	}

	await tx.set(id, {
		...lineItem,
		quantity,
	});
}

async function deleteLineItem(
	tx: WriteTransaction,
	input: { id: string; orderID?: string | undefined },
) {
	const { id, orderID } = input;

	if (orderID) {
		const order = await tx.get<StoreOrder>(orderID);
		if (!order) throw new Error("order not found");
		const newItems = (order.items ?? []).filter((item) => item.id !== id);
		const subtotal = Effect.runSync(
			cartSubtotal(newItems as StoreLineItem[], order),
		);
		return await tx.set(order.id, {
			...order,
			items: newItems,
			subtotal,
			total: subtotal,
		});
	}

	const lineItem = await tx.get<StoreLineItem>(id);
	if (!lineItem) {
		console.info("Line item  not found");
		throw new Error("Line item not found");
	}
	await tx.del(id);
}

export { createLineItem, deleteLineItem, updateLineItem };
