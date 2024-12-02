import type { ActionFunctionArgs } from "@remix-run/cloudflare";
import { SESSION_KEY } from "~/constants";
import { Authentication } from "~/lib/authentication";
import { userContext } from "~/server/sessions.server";

export async function action({ request, context }: ActionFunctionArgs) {
	const { session } = context;
	const cookieHeader = request.headers.get("Cookie");
	const cookie = (await userContext?.parse(cookieHeader)) || {};
	const auth = Authentication({
		env: context.cloudflare.env,
	});

	const sessionId = session.get(SESSION_KEY);
	const response = await auth.invalidateSession(sessionId);
	if (!response.ok) {
		console.error("response error", response.statusText);
	}

	cookie.authUser = null;
	cookie.userSession = null;
	session.unset(SESSION_KEY);

	return Response.json(
		{},
		{
			headers: {
				"Set-Cookie": await userContext?.serialize(cookie, {
					maxAge: 31536000,
					path: "/",
					httpOnly: true,
				}),
			},
		},
	);
}
