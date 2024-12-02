import type {
	CreateOrder,
	StoreLineItem,
	StoreOrder,
	UpdateOrder,
} from "@blazzing-app/validators";
import type { WriteTransaction } from "replicache";
import { cartSubtotal } from "../../util/get-line-item-price";
import { Effect } from "effect";

async function createOrder(tx: WriteTransaction, input: CreateOrder) {
	const { order } = input;
	await tx.set(order.id, order);
}

async function updateOrder(tx: WriteTransaction, input: UpdateOrder) {
	const { id, updates } = input;
	const order = await tx.get<StoreOrder>(id);
	if (!order) throw new Error("Order not found");

	await tx.set(id, { ...order, ...updates });
}

async function deleteOrder(tx: WriteTransaction, input: { keys: string[] }) {
	const { keys } = input;
	await Promise.all(keys.map((key) => tx.del(key)));
}

async function updateOrderTotals(tx: WriteTransaction, input: { id: string }) {
	const { id } = input;
	const order = (await tx.get(id)) as StoreOrder;
	if (!order) throw new Error("Order not found");

	const subtotal = Effect.runSync(
		cartSubtotal(order.items as StoreLineItem[], order).pipe(Effect.orDie),
	);
	await tx.set(order.id, { ...order, subtotal, total: subtotal });
}
export { createOrder, updateOrder, deleteOrder, updateOrderTotals };
