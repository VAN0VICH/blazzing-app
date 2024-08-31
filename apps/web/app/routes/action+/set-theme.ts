import { parseWithZod } from "@conform-to/zod";
import { invariantResponse } from "@epic-web/invariant";
import { json, type ActionFunctionArgs } from "@remix-run/cloudflare";
import { prefs } from "~/sessions.server";
import { ThemeSchema } from "~/validators/state";

export async function action({ request }: ActionFunctionArgs) {
	const cookieHeader = request.headers.get("Cookie");
	const cookie = (await prefs.parse(cookieHeader)) || {};
	const formData = await request.formData();
	const submission = parseWithZod(formData, {
		schema: ThemeSchema,
	});

	invariantResponse(submission.status === "success", "Invalid theme received");
	const { theme } = submission.value;
	cookie.theme = theme === "inherit" ? "" : theme;
	const maxAge = theme === "inherit" ? -1 : 31536000;
	return json(
		{ result: submission.reply() },
		{
			headers: {
				"Set-Cookie": await prefs.serialize(cookie, {
					maxAge,
					path: "/",
					httpOnly: true,
				}),
			},
		},
	);
}
