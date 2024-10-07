import type {
	DeleteImage,
	UpdateImagesOrder,
	UploadImages,
} from "@blazzing-app/validators";
import type { Variant } from "@blazzing-app/validators/client";
import type { WriteTransaction } from "replicache";
import { entityNotFound } from "./price";

async function updateImagesOrder(
	tx: WriteTransaction,
	input: UpdateImagesOrder,
) {
	const { order, entityID } = input;

	const entity = (await tx.get(entityID)) as Variant | undefined;
	const isVariant = entityID.startsWith("variant");

	if (!entity) {
		return entityNotFound(entityID);
	}

	const images = entity.images ? structuredClone(entity.images) : [];

	for (const image of images) {
		const o = order[image.id];
		if (o !== undefined) image.order = o;
	}
	images.sort((a, b) => a.order - b.order);

	return await tx.set(entityID, {
		...entity,
		images,
		...(isVariant && { thumbnail: images[0] }),
	});
}

async function uploadImages(tx: WriteTransaction, input: UploadImages) {
	const { entityID, images } = input;

	const entity = (await tx.get(entityID)) as Variant | undefined;
	const isVariant = entityID.startsWith("variant");

	if (!entity) {
		return entityNotFound(entityID);
	}

	if (images.length === 0) {
		return;
	}

	const updatedImages = [...(entity.images ? entity.images : []), ...images];

	return await tx.set(entityID, {
		...entity,
		images: updatedImages,
		...(isVariant && { thumbnail: updatedImages[0] }),
	});
}

async function deleteImage(tx: WriteTransaction, input: DeleteImage) {
	const { keys, entityID } = input;

	const entity = (await tx.get(entityID)) as Variant | undefined;

	if (!entity) {
		return entityNotFound(entityID);
	}

	await tx.set(entityID, {
		...entity,
		images: entity.images?.filter((image) => !keys.includes(image.id)),
	});
}
export { deleteImage, updateImagesOrder, uploadImages };
