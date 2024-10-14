import type { Routes } from "@blazzing-app/functions";
import { type ActionFunctionArgs, json, redirect } from "@remix-run/cloudflare";
import { hc } from "hono/client";
import { SESSION_KEY } from "~/constants";

export async function loader({ request, context }: ActionFunctionArgs) {
	const {
		cloudflare: { env },
		session,
	} = context;
	const url = new URL(request.url);

	const code = url.searchParams.get("code");
	const state = url.searchParams.get("state");
	const error = url.searchParams.get("error");

	if (error) {
		console.error("Google OAuth error", error);
		return redirect("/login");
	}
	const stateCookie = session.get("google_oauth_state") ?? null;
	const codeVerifier = session.get("code_verifier") ?? null;
	// verify state
	if (
		!state ||
		!stateCookie ||
		!code ||
		stateCookie !== state ||
		codeVerifier === null
	) {
		console.error("unauthorized");
		return json("Unauthorized", {
			status: 401,
		});
	}
	const client = hc<Routes>(env.WORKER_URL);

	const response = await client.auth["google-callback"].$post({
		json: {
			code,
			codeVerifier,
		},
	});
	if (response.ok) {
		const {
			isOnboard,
			success,
			message,
			session: userSession,
		} = await response.json();

		if (!success || !userSession) {
			console.error(message);
			return redirect("/login");
		}
		session.set(SESSION_KEY, userSession.id);

		return isOnboard ? redirect("/onboarding") : redirect("/dashboard/store");
	}
	console.log("error login");

	return redirect("/login");
}
