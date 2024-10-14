import { Authentication } from "@blazzing-app/core";
import type { AuthSession, AuthUser } from "@blazzing-app/validators";
import type { Session, SessionData } from "@remix-run/cloudflare";
import type { Context } from "hono";

export const getUserAndSession = async (
	c: Context,
	honoSession: Session<SessionData, SessionData>,
): Promise<{ user: AuthUser | null; session: AuthSession | null }> => {
	const auth = Authentication({
		env: c.env,
	});
	const sessionID =
		(honoSession.get(auth.sessionKey) as string) ??
		auth.readBearerToken(c.req.raw.headers.get("Authorization") ?? "");

	if (!sessionID) {
		return { user: null, session: null };
	}

	const { session, user } = await auth.validateSession(sessionID);
	if (!session || !user) {
		return { user: null, session: null };
	}
	if (session && !session.fresh && user) {
		await auth.invalidateSession(session.id);
		const newSession = await auth.createSession(user.id);
		honoSession.set(auth.sessionKey, newSession.id);
	}

	return { session, user: user };
};
