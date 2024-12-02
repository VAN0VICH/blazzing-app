import { parseWithZod } from "@conform-to/zod";
import { invariantResponse } from "@epic-web/invariant";
import type { ActionFunctionArgs } from "@remix-run/cloudflare";
import { z } from "zod";
import { userContext } from "~/server/sessions.server";
const schema = z.object({
	cartID: z.string(),
});

export async function action({ request }: ActionFunctionArgs) {
	const cookieHeader = request.headers.get("Cookie");
	const cookie = (await userContext?.parse(cookieHeader)) || {};
	const formData = await request.formData();
	const submission = parseWithZod(formData, {
		schema,
	});

	invariantResponse(submission.status === "success", "Invalid cartid received");
	const { cartID } = submission.value;
	cookie.cartID = cartID;
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
