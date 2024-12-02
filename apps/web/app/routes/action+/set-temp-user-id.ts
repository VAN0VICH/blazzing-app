import { parseWithZod } from "@conform-to/zod";
import { invariantResponse } from "@epic-web/invariant";
import type { ActionFunctionArgs } from "@remix-run/cloudflare";
import { z } from "zod";
import { userContext } from "~/server/sessions.server";
const schema = z.object({
	tempUserID: z.string(),
});

export async function action({ request }: ActionFunctionArgs) {
	const cookieHeader = request.headers.get("Cookie");
	const cookie = (await userContext?.parse(cookieHeader)) || {};
	const formData = await request.formData();
	const submission = parseWithZod(formData, {
		schema,
	});

	invariantResponse(
		submission.status === "success",
		"Invalid tempUserID received",
	);
	const { tempUserID } = submission.value;
	cookie.tempUserID = tempUserID;
	return Response.json(
		{ result: submission.reply() },
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
