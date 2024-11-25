import type { UpdateAddress } from "@blazzing-app/validators";
import type { WriteTransaction } from "replicache";
import type { StoreAddress } from "../../../../validators/src/store-entities";

async function updateAddress(tx: WriteTransaction, input: UpdateAddress) {
	const { id, updates } = input;
	const address = await tx.get<StoreAddress>(id);

	if (!address) {
		console.info("Address  not found");
		throw new Error("Address not found");
	}

	await tx.set(id, {
		...address,
		...updates,
	});
}
export { updateAddress };
