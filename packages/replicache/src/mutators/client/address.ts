import type { UpdateAddress } from "@blazzing-app/validators";
import type { WriteTransaction } from "replicache";
import type { Address } from "@blazzing-app/validators/client";

async function updateAddress(tx: WriteTransaction, input: UpdateAddress) {
	const { id, updates } = input;
	const address = await tx.get<Address>(id);

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
