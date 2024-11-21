import type { Routes } from "@blazzing-app/functions";
import { type ActionFunctionArgs, redirect } from "@remix-run/cloudflare";
import { hc } from "hono/client";

export async function action({ request, context }: ActionFunctionArgs) {
	const {
		cloudflare: { env },
		session,
	} = context;

	const honoClient = hc<Routes>(env.WORKER_URL);

	const response = await honoClient.auth.google.$get(
		{},
		{
			headers: {
				"x-publishable-key": env.BLAZZING_PUBLISHABLE_KEY,
			},
		},
	);
	const url = new URL(request.url);
	const errorURL = new URL(`${url.origin}/error`);
	errorURL.searchParams.set("error", "Error authenticating");

	if (response.ok) {
		const {
			url: googleURL,
			success,
			codeVerifier,
			state,
		} = await response.json();
		if (!success || !googleURL || !codeVerifier || !state) {
			return redirect(errorURL.toString());
		}
		session.set("google_oauth_state", state);
		session.set("code_verifier", codeVerifier);
		return redirect(googleURL);
	}
	console.error("error authenticating", response.status);

	return redirect(errorURL.toString());
}
