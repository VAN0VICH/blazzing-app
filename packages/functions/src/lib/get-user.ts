import type { Auth, AuthSession, AuthUser } from "@blazzing-app/validators";
import type { Context } from "hono";
import { isWithinExpirationDate, TimeSpan } from "oslo";
import App from "../index";

const sessionExpiresIn = new TimeSpan(30, "d");
export const getAuthUser = async (c: Context): Promise<AuthUser | null> => {
	const sessionID = readBearerToken(
		c.req.raw.headers.get("Authorization") ?? "",
	);

	if (!sessionID) {
		return null;
	}

	const { session, user } = await validateSession(sessionID, c);

	if (!session) {
		return null;
	}
	return user ?? null;
};

const readBearerToken = (authorizationHeader: string) => {
	const [authScheme, token] = authorizationHeader.split(" ") as [
		string,
		string | undefined,
	];
	if (authScheme !== "Bearer") {
		return null;
	}
	return token ?? null;
};

const validateSession = async (sessionID: string, c: Context) => {
	const response = await App.request(
		`/auth/user-and-session?sessionID=${sessionID}`,
		{ headers: { "x-publishable-key": c.env.BLAZZING_PUBLISHABLE_KEY } },
		c.env,
		c.executionCtx,
	);
	const { session, user } = (await response.json()) as Auth;

	if (!session) {
		return { user: null, session: null };
	}

	const expirationDate = new Date(session.expiresAt);
	const activePeriodExpirationDate = new Date(
		expirationDate.getTime() - sessionExpiresIn.milliseconds() / 2,
	);

	if (!isWithinExpirationDate(expirationDate)) {
		await App.request(
			"/auth/delete-session",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"x-publishable-key": c.env.BLAZZING_PUBLISHABLE_KEY,
				},
				body: JSON.stringify({ sessionID }),
			},
			c.env,
			c.executionCtx,
		);
		console.log("validate session 5...");
		return { user: null, session: null };
	}

	const currentSession: AuthSession = {
		...session,
		fresh: isWithinExpirationDate(activePeriodExpirationDate),
	};

	return { user, session: currentSession };
};
