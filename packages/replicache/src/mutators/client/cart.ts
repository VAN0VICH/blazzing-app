import type { CreateCart, UpdateCart } from "@blazzing-app/validators";
import type { StoreAddress } from "../../../../validators/src/store-entities";
import type { WriteTransaction } from "replicache";
async function createCart(tx: WriteTransaction, input: CreateCart) {
	const { cart } = input;

	await tx.set(cart.id, cart);
}

async function updateCart(tx: WriteTransaction, input: UpdateCart) {
	const { id, updates } = input;
	const cart = await tx.get<StoreAddress>(id);

	if (!cart) {
		console.info("cart  not found");
		throw new Error("cart not found");
	}

	await tx.set(id, {
		...cart,
		...updates,
	});
}
export { createCart, updateCart };
