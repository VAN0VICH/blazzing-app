import type { Routes } from "@blazzing-app/functions";
import { type ActionFunctionArgs, redirect } from "@remix-run/cloudflare";
import { hc } from "hono/client";
import { SESSION_KEY } from "~/constants";

export async function action({ context }: ActionFunctionArgs) {
	const {
		cloudflare: { env },
		session,
	} = context;

	const client = hc<Routes>(env.WORKER_URL);

	const response = await client.auth["create-test-user"].$post();
	if (response.ok) {
		const { success, message, session: userSession } = await response.json();

		if (!success || !userSession) {
			console.error(message);
			return redirect("/login");
		}
		session.set(SESSION_KEY, userSession.id);

		return redirect("/dashboard/store");
	}
	console.log("error login");

	return redirect("/login");
}
