import type { WriteTransaction } from "replicache";

import type {
	CreateStore,
	DeleteStoreImage,
	SetActiveStoreID,
	UpdateStore,
} from "@blazzing-app/validators";
import type { Store } from "../../../../validators/src/store-entities";

async function createStore(tx: WriteTransaction, input: CreateStore) {
	const { store } = input;
	await tx.set(store.id, store);
}

async function updateStore(tx: WriteTransaction, input: UpdateStore) {
	const { id, updates } = input;

	const store = await tx.get<Store>(id);

	if (!store) {
		console.info("Store  not found");
		throw new Error("Store not found");
	}

	return tx.set(id, {
		...store,
		...(updates.name && { name: updates.name }),
		...(updates.currencyCodes && { currencyCodes: updates.currencyCodes }),
		...(updates.description && { description: updates.description }),
		...(updates.image && updates.croppedImage
			? {
					image: {
						...updates.image,
						cropped: updates.croppedImage,
					},
				}
			: updates.croppedImage
				? {
						image: {
							...store.image,
							cropped: updates.croppedImage,
						},
					}
				: {}),
		...(updates.headerImage && updates.croppedHeaderImage
			? {
					headerImage: {
						...updates.headerImage,
						cropped: updates.croppedHeaderImage,
					},
				}
			: updates.croppedHeaderImage
				? {
						headerImage: {
							...store.headerImage,
							cropped: updates.croppedHeaderImage,
						},
					}
				: {}),
	});
}

async function setActiveStoreID(tx: WriteTransaction, input: SetActiveStoreID) {
	const { id } = input;

	return tx.set("active_store_id", {
		value: id,
	});
}
async function deleteStoreImage(tx: WriteTransaction, input: DeleteStoreImage) {
	const { storeID, type } = input;

	const store = await tx.get<Store>(storeID);

	if (!store) {
		console.info("Store  not found");
		throw new Error("Store not found");
	}

	return tx.set(
		storeID,
		type === "store"
			? { ...store, image: null }
			: { ...store, headerImage: null },
	);
}

export { createStore, deleteStoreImage, setActiveStoreID, updateStore };
