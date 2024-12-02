import {
	DeleteAvatarSchema,
	ImageUploadError,
	NeonDatabaseError,
	NotFound,
	UpdateUserSchema,
	type Image,
	type UploadResponse,
} from "@blazzing-app/validators";
import { Console, Effect, pipe } from "effect";
import { TableMutator } from "../../context/table-mutator";
import { fn } from "../../util/fn";
import { Cloudflare, Database } from "@blazzing-app/shared";
import * as base64 from "base64-arraybuffer";

const deleteAvatar = fn(DeleteAvatarSchema, (input) =>
	Effect.gen(function* () {
		const { userID, url } = input;
		const { env } = yield* Cloudflare;
		const tableMutator = yield* TableMutator;
		const splitted = url.split("/");
		const cloudflareID = splitted[splitted.length - 2];

		yield* tableMutator.update(
			userID,
			{
				avatar: null,
			},
			"users",
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
const updateUser = fn(UpdateUserSchema, (input) =>
	Effect.gen(function* () {
		const tableMutator = yield* TableMutator;
		const { manager } = yield* Database;
		const { env } = yield* Cloudflare;
		const { id, updates } = input;

		const user = yield* Effect.tryPromise(() =>
			manager.query.users.findFirst({
				where: (users, { eq }) => eq(users.id, id),
			}),
		).pipe(
			Effect.catchTags({
				UnknownException: (error) =>
					new NeonDatabaseError({ message: error.message }),
			}),
		);

		if (!user) {
			return yield* Effect.fail(
				new NotFound({ message: `Entity not found: id = ${id}` }),
			);
		}

		const imagesToUpload: Image[] = [];
		const imagesToDelete: string[] = [];
		/* upload */
		updates.avatar && imagesToUpload.push(updates.avatar);
		updates.croppedAvatar && imagesToUpload.push(updates.croppedAvatar);
		/* delete */
		typeof user.avatar === "object" &&
			user.avatar?.url &&
			updates.avatar?.url &&
			imagesToDelete.push(user.avatar.url);
		typeof user.avatar === "object" &&
			user.avatar?.cropped &&
			updates.croppedAvatar &&
			imagesToDelete.push(user.avatar.cropped.url);

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
						const file = new File(
							[bytes],
							`${user.username ?? "Unknown"}'s avatar`,
							{
								type: image.fileType,
							},
						);
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
					avatar: map.get(updates.avatar?.id ?? "") ?? null,
					croppedAvatar: map.get(updates.croppedAvatar?.id ?? "") ?? null,
				};
				return object;
			}),
			Effect.flatMap(({ avatar, croppedAvatar }) =>
				tableMutator.update(
					user.id,
					{
						...(updates.fullName && { fullName: updates.fullName }),
						...(updates.description && {
							description: updates.description,
						}),
						...(updates.username && { username: updates.username }),
						...(updates.email && { email: updates.email }),
						...(updates.phone && { phone: updates.phone }),

						...(avatar && croppedAvatar
							? {
									avatar: {
										...avatar,
										cropped: {
											url: croppedAvatar.url,
										},
									},
								}
							: croppedAvatar
								? {
										avatar:
											typeof user.avatar === "object"
												? {
														...user.avatar,
														cropped: {
															url: croppedAvatar.url,
														},
													}
												: user.avatar,
									}
								: {}),
					},
					"users",
				),
			),
		);
	}),
);
export { updateUser, deleteAvatar };
