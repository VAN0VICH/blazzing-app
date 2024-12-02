import type { AddAdmin, RemoveAdmin, Store } from "@blazzing-app/validators";
import type { WriteTransaction } from "replicache";

async function addAdmin(tx: WriteTransaction, input: AddAdmin) {
	const { email, storeID } = input;
	const store = await tx.get<Store>(storeID);
	if (!store) {
		throw new Error("Store not found");
	}

	if (store.admins?.some((a) => a.admin.email === email)) return;

	await tx.set(storeID, {
		...store,
		admins: [...(store.admins ?? []), { admin: { email } }],
	});
}
async function removeAdmin(tx: WriteTransaction, input: RemoveAdmin) {
	const { email, storeID } = input;
	const store = await tx.get<Store>(storeID);
	if (!store) {
		throw new Error("Store not found");
	}

	await tx.set(storeID, {
		...store,
		admins: (store.admins ?? []).filter((a) => a.admin.email !== email),
	});
}
export { addAdmin, removeAdmin };
