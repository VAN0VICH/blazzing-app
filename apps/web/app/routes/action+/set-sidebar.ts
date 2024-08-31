import { parseWithZod } from "@conform-to/zod";
import { invariantResponse } from "@epic-web/invariant";
import { json, type ActionFunctionArgs } from "@remix-run/cloudflare";
import { prefs } from "~/sessions.server";
import { SidebarStateSchema } from "~/validators/state";

export async function action({ request }: ActionFunctionArgs) {
	const cookieHeader = request.headers.get("Cookie");
	const cookie = (await prefs.parse(cookieHeader)) || {};
	const formData = await request.formData();
	const submission = parseWithZod(formData, {
		schema: SidebarStateSchema,
	});

	invariantResponse(
		submission.status === "success",
		"Invalid sidebar state received",
	);
	const { sidebarState } = submission.value;
	cookie.sidebarState = sidebarState;
	return json(
		{ result: submission.reply() },
		{
			headers: {
				"Set-Cookie": await prefs.serialize(cookie, {
					maxAge: 31536000,
					path: "/",
					httpOnly: true,
				}),
			},
		},
	);
}
