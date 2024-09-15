import { parseWithZod } from "@conform-to/zod";
import { invariantResponse } from "@epic-web/invariant";
import { json, type ActionFunctionArgs } from "@remix-run/cloudflare";
import { prefs } from "~/sessions.server";
import { PreferencesSchema } from "~/validators/state";

export async function action({ request }: ActionFunctionArgs) {
	const cookieHeader = request.headers.get("Cookie");
	const cookie = (await prefs.parse(cookieHeader)) || {};
	const formData = await request.formData();
	const submission = parseWithZod(formData, {
		schema: PreferencesSchema,
	});

	invariantResponse(
		submission.status === "success",
		"Invalid preference received",
	);
	const { accentColor, grayColor, scaling, sidebarState, theme } =
		submission.value;
	if (accentColor) {
		cookie.accentColor = accentColor;
	}
	if (grayColor) {
		cookie.grayColor = grayColor;
	}
	if (scaling) {
		cookie.scaling = scaling;
	}
	if (sidebarState) {
		cookie.sidebarState = sidebarState;
	}
	if (theme) {
		cookie.theme = theme;
	}
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
