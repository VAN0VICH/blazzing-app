import { getAuth } from "@hono/clerk-auth";
import type { Context } from "hono";
import { createClerkClient } from "@clerk/backend";
import type { AuthUser } from "@blazzing-app/validators";

export const getAuthUser = async (c: Context): Promise<AuthUser | null> => {
	const auth = getAuth(c);
	if (!auth?.userId) {
		return null;
	}
	const clerkClient = createClerkClient({ secretKey: c.env.CLERK_SECRET_KEY });
	const response = await clerkClient.users.getUser(auth.userId);

	return {
		id: auth.userId,
		avatar: response.imageUrl,
		email: response.emailAddresses[0]!.emailAddress,
		fullName: response.fullName,
	};
};
