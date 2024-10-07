import type { WriteTransaction } from "replicache";

import type { UpdateUser } from "@blazzing-app/validators";
import type { User } from "@blazzing-app/validators/client";

async function updateUser(tx: WriteTransaction, input: UpdateUser) {
	const { id, updates } = input;
	const user = await tx.get<User>(id);
	if (!user) {
		console.info("User  not found");
		throw new Error("User not found");
	}
	await tx.set(id, { ...user, ...updates });
}

export { updateUser };
