import type { WriteTransaction } from "replicache";

import type {
	DeleteAvatar,
	StoreUser,
	UpdateUser,
} from "@blazzing-app/validators";

async function updateUser(tx: WriteTransaction, input: UpdateUser) {
	const { id, updates } = input;
	const user = await tx.get<StoreUser>(id);
	if (!user) {
		console.info("User  not found");
		throw new Error("User not found");
	}
	await tx.set(id, {
		...user,
		...(updates.fullName && { fullName: updates.fullName }),
		...(updates.username && { username: updates.username }),
		...(updates.description && { description: updates.description }),
		...(updates.email && { email: updates.email }),
		...(updates.phone && { phone: updates.phone }),
		...(updates.avatar && updates.croppedAvatar
			? {
					avatar: {
						...updates.avatar,
						cropped: updates.croppedAvatar,
					},
				}
			: updates.croppedAvatar
				? {
						avatar:
							typeof user.avatar === "object"
								? {
										...user.avatar,
										cropped: updates.croppedAvatar,
									}
								: user.avatar,
					}
				: {}),
	});
}
async function deleteAvatar(tx: WriteTransaction, input: DeleteAvatar) {
	const { userID } = input;

	const user = await tx.get<StoreUser>(userID);

	if (!user) {
		console.info("User  not found");
		throw new Error("User not found");
	}

	return tx.set(userID, {
		avatar: null,
	});
}
export { updateUser, deleteAvatar };
