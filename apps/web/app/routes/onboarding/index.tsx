import type { Routes } from "@blazzing-app/functions";
import { parseWithZod } from "@conform-to/zod";
import { json, redirect, type ActionFunctionArgs } from "@remix-run/cloudflare";
import { useSearchParams } from "@remix-run/react";
import { AnimatePresence } from "framer-motion";
import { hc } from "hono/client";
import { Onboard, UserOnboardSchema } from "./onboard";
import { SESSION_KEY } from "~/constants";

//

export async function action({
	request,
	context: {
		cloudflare: { env },
		session,
		authUser,
	},
}: ActionFunctionArgs) {
	const formData = await request.formData();
	const submission = parseWithZod(formData, {
		schema: UserOnboardSchema,
	});
	if (submission.status !== "success") {
		return json({ result: submission.reply() });
	}
	if (!authUser)
		return json({
			result: submission.reply({
				fieldErrors: {
					username: ["Unauthorized."],
				},
			}),
		});
	const url = new URL(request.url);
	const redirectTo = url.searchParams.get("redirectTo");
	const honoClient = hc<Routes>(env.WORKER_URL);
	const userResponse = await honoClient.user.username.$get(
		{
			query: {
				username: submission.value.username,
			},
		},

		{
			headers: {
				"x-publishable-key": env.BLAZZING_PUBLISHABLE_KEY,
			},
		},
	);
	const sessionID = session.get(SESSION_KEY);
	if (userResponse.ok) {
		const { result } = await userResponse.json();
		if (result?.username) {
			return json({
				result: submission.reply({
					fieldErrors: {
						username: ["Username already exist."],
					},
				}),
			});
		}
	}
	const onboardResponse = await honoClient.user.onboard.$post(
		{
			json: {
				countryCode: submission.value.countryCode,
				username: submission.value.username,
			},
		},
		{
			headers: {
				Authorization: `Bearer ${sessionID}`,
				"x-publishable-key": env.BLAZZING_PUBLISHABLE_KEY,
			},
		},
	);
	if (onboardResponse.ok) {
		const { success, message } = await onboardResponse.json();
		if (!success) {
			return json({
				result: submission.reply({
					fieldErrors: {
						username: [message ?? "Error onboarding"],
					},
				}),
			});
		}

		return redirectTo ? redirect(redirectTo) : redirect("/dashboard");
	}
	return json({
		result: submission.reply({
			fieldErrors: {
				username: ["Something wrong happened."],
			},
		}),
	});
}

export default function Page() {
	const [search] = useSearchParams();
	const step = search.get("step");
	return (
		<main className="w-screen h-screen bg-background">
			<div className="fixed -z-10 left-0 right-0 h-[450px] opacity-60 bg-gradient-to-b from-brand-3 to-transparent " />
			<AnimatePresence mode="wait">
				{(!step || step === "create") && <Onboard />}
				{/* {step === "connect" && <ConnectStripe storeId={storeId} />} */}
			</AnimatePresence>
		</main>
	);
}
