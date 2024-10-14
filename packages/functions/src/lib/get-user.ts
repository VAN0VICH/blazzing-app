import { Authentication } from "@blazzing-app/core";
import type { AuthUser } from "@blazzing-app/validators";
import type { Context } from "hono";

export const getAuthUser = async (c: Context): Promise<AuthUser | null> => {
	const auth = Authentication({
		env: c.env,
	});
	const sessionID = auth.readBearerToken(
		c.req.raw.headers.get("Authorization") ?? "",
	);

	if (!sessionID) {
		return null;
	}

	const { session, user } = await auth.validateSession(sessionID);
	if (!session) {
		return null;
	}
	return user ?? null;
};
