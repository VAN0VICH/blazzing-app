import { Console, Effect, pipe } from "effect";

import { Cloudflare, Database } from "@blazzing-app/shared";
import {
	CreateStoreSchema,
	DeleteStoreImageSchema,
	ImageUploadError,
	NeonDatabaseError,
	NotFound,
	SetActiveStoreIDSchema,
	UpdateStoreSchema,
	type Image,
	type UploadResponse,
} from "@blazzing-app/validators";
import { TableMutator } from "../../context/table-mutator";
import { fn } from "../../util/fn";
import * as base64 from "base64-arraybuffer";

const createStore = fn(CreateStoreSchema, (input) =>
	Effect.gen(function* () {
		const tableMutator = yield* TableMutator;
		const { store } = input;

		return yield* tableMutator.set(store, "stores");
	}),
);

const updateStore = fn(UpdateStoreSchema, (input) =>
	Effect.gen(function* () {
		const tableMutator = yield* TableMutator;
		const { manager } = yield* Database;
		const { env } = yield* Cloudflare;
		const { id, updates } = input;

		const store = yield* Effect.tryPromise(() =>
			manager.query.stores.findFirst({
				where: (stores, { eq }) => eq(stores.id, id),
			}),
		).pipe(
			Effect.catchTags({
				UnknownException: (error) =>
					new NeonDatabaseError({ message: error.message }),
			}),
		);

		if (!store) {
			return yield* Effect.fail(
				new NotFound({ message: `Entity not found: id = ${id}` }),
			);
		}

		const imagesToUpload: Image[] = [];
		const imagesToDelete: string[] = [];
		/* upload */
		updates.image && imagesToUpload.push(updates.image);
		updates.croppedImage && imagesToUpload.push(updates.croppedImage);
		updates.headerImage && imagesToUpload.push(updates.headerImage);
		updates.croppedHeaderImage &&
			imagesToUpload.push(updates.croppedHeaderImage);

		/* delete */
		store.image?.url &&
			updates.image?.url &&
			imagesToDelete.push(store.image.url);
		store.image?.cropped &&
			updates.croppedImage &&
			imagesToDelete.push(store.image.cropped.url);
		store.headerImage?.url &&
			updates.headerImage?.url &&
			imagesToDelete.push(store.headerImage.url);
		store.headerImage?.cropped &&
			updates.croppedHeaderImage &&
			imagesToDelete.push(store.headerImage.cropped.url);

		const uploadEffect = Effect.forEach(
			imagesToUpload,
			(image) => {
				return pipe(
					Effect.gen(function* () {
						if (!image.base64 || !image.fileType)
							return yield* new ImageUploadError({
								message: "Image not found. Base 64 not found",
							});
						const decoded = base64.decode(image.base64);
						const bytes = new Uint8Array(decoded);
						const file = new File([bytes], "store image", {
							type: image.fileType,
						});
						const formData = new FormData();
						formData.append("file", file);
						return formData;
					}),
					Effect.flatMap((formData) =>
						Effect.tryPromise(() =>
							fetch(
								`https://api.cloudflare.com/client/v4/accounts/${env.ACCOUNT_ID}/images/v1`,

								{
									method: "POST",
									body: formData,
									headers: {
										Authorization: `Bearer ${env.IMAGE_API_TOKEN}`,
									},
								},
							).then(async (res) => (await res.json()) as UploadResponse),
						).pipe(Effect.orDie),
					),
					Effect.flatMap((response) =>
						Effect.gen(function* () {
							if (response.errors.length > 0) {
								yield* Console.log("Error uploading image", response.errors);
								yield* new ImageUploadError({
									message: "Error uploading image",
								});
							}
							return response;
						}),
					),
					Effect.map(
						(response) =>
							({
								id: image.id,
								url: response.result?.variants[0]!,
								order: image.order,
								alt: "AI GENERATED",
								fileType: image.fileType,
							}) satisfies Image,
					),
				);
			},
			{
				concurrency: 4,
			},
		);
		const deleteEffect = Effect.forEach(
			imagesToDelete,
			(url) =>
				Effect.gen(function* () {
					const splitted = url.split("/");
					const cloudflareID = splitted[splitted.length - 2];
					if (!cloudflareID) return;
					yield* Effect.tryPromise(() =>
						fetch(
							`https://api.cloudflare.com/client/v4/accounts/${env.ACCOUNT_ID}/images/v1/${cloudflareID}`,
							{
								method: "DELETE",
								headers: {
									Authorization: `Bearer ${env.IMAGE_API_TOKEN}`,
								},
							},
						),
					).pipe(Effect.orDie);
				}),

			{
				concurrency: 4,
			},
		);

		yield* Effect.all([uploadEffect, deleteEffect], { concurrency: 2 }).pipe(
			Effect.map(([uploaded]) => {
				const map = new Map<string, Image>();
				for (const image of uploaded) {
					map.set(image.id, image);
				}
				const object = {
					image: map.get(updates.image?.id ?? "") ?? null,
					croppedImage: map.get(updates.croppedImage?.id ?? "") ?? null,
					headerImage: map.get(updates.headerImage?.id ?? "") ?? null,
					croppedHeaderImage:
						map.get(updates.croppedHeaderImage?.id ?? "") ?? null,
				};
				return object;
			}),
			Effect.flatMap(
				({ croppedHeaderImage, headerImage, croppedImage, image }) =>
					tableMutator.update(
						store.id,
						{
							...(updates.name && { name: updates.name }),
							...(updates.description && { description: updates.description }),
							...(updates.currencyCodes && {
								currencyCodes: updates.currencyCodes,
							}),
							...(image && croppedImage
								? {
										image: {
											...image,
											cropped: {
												url: croppedImage.url,
											},
										},
									}
								: croppedImage
									? {
											image: {
												...store.image,
												cropped: {
													url: croppedImage.url,
												},
											},
										}
									: {}),
							...(headerImage && croppedHeaderImage
								? {
										headerImage: {
											...headerImage,
											cropped: croppedHeaderImage,
										},
									}
								: croppedHeaderImage
									? {
											headerImage: {
												...store.headerImage,
												cropped: {
													url: croppedHeaderImage.url,
												},
											},
										}
									: {}),
						},
						"stores",
					),
			),
		);
	}),
);

const deleteStoreImage = fn(DeleteStoreImageSchema, (input) =>
	Effect.gen(function* () {
		const { storeID, type, url } = input;
		const { env } = yield* Cloudflare;
		const tableMutator = yield* TableMutator;
		const splitted = url.split("/");
		const cloudflareID = splitted[splitted.length - 2];

		yield* tableMutator.update(
			storeID,
			{
				[type === "store" ? "image" : "headerImage"]: null,
			},
			"stores",
		);

		if (cloudflareID)
			yield* Effect.tryPromise(async () => {
				await fetch(
					`https://api.cloudflare.com/client/v4/accounts/${env.ACCOUNT_ID}/images/v1/${cloudflareID}`,
					{
						method: "DELETE",
						headers: {
							Authorization: `Bearer ${env.IMAGE_API_TOKEN}`,
						},
					},
				);
			}).pipe(
				Effect.retry({ times: 3 }),
				Effect.scoped,
				Effect.catchAll((e) =>
					Effect.gen(function* () {
						yield* Console.error("Error deleting image", e.message);
						return {};
					}),
				),
			);
	}),
);
const setActiveStoreID = fn(SetActiveStoreIDSchema, (input) =>
	Effect.gen(function* (_) {
		const tableMutator = yield* _(TableMutator);
		const { id } = input;

		return yield* _(
			tableMutator.update("active_store_id", { value: id }, "json"),
		);
	}),
);

export { createStore, deleteStoreImage, setActiveStoreID, updateStore };
