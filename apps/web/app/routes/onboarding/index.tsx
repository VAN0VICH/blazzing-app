import type { Routes } from "@blazzing-app/functions";
import { getAuth } from "@clerk/remix/ssr.server";
import { parseWithZod } from "@conform-to/zod";
import {
	redirect,
	type ActionFunctionArgs,
	type LoaderFunction,
} from "@remix-run/cloudflare";
import { useSearchParams } from "@remix-run/react";
import { AnimatePresence } from "framer-motion";
import { hc } from "hono/client";
import { Onboard, UserOnboardSchema } from "./onboard";

export const loader: LoaderFunction = async (args) => {
	const { userId, getToken } = await getAuth(args);
	const token = await getToken();
	if (!userId || !token) return redirect("/sign-up");
	const honoClient = hc<Routes>(args.context.cloudflare.env.WORKER_URL);
	const userResponse_ = await honoClient.user["auth-id"].$get(
		{
			query: {
				authID: userId,
			},
		},
		{
			headers: {
				"x-publishable-key":
					args.context.cloudflare.env.BLAZZING_PUBLISHABLE_KEY,
			},
		},
	);
	if (userResponse_.ok) {
		const { result } = await userResponse_.json();

		if (result) {
			return redirect("/dashboard/store");
		}
	}
	return Response.json({});
};

export async function action(args: ActionFunctionArgs) {
	const {
		context: {
			cloudflare: { env },
		},
		request,
	} = args;
	const formData = await request.formData();
	const submission = parseWithZod(formData, {
		schema: UserOnboardSchema,
	});
	if (submission.status !== "success") {
		return Response.json({ result: submission.reply() });
	}
	const honoClient = hc<Routes>(args.context.cloudflare.env.WORKER_URL);
	const url = new URL(request.url);
	const redirectTo = url.searchParams.get("redirectTo");
	const { getToken } = await getAuth(args);
	const token = await getToken();
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
	if (userResponse.ok) {
		const { result } = await userResponse.json();
		if (result?.username) {
			return Response.json({
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
				Authorization: `Bearer ${token}`,
				"x-publishable-key": env.BLAZZING_PUBLISHABLE_KEY,
			},
		},
	);
	if (onboardResponse.ok) {
		const { success, message } = await onboardResponse.json();
		if (!success) {
			return Response.json({
				result: submission.reply({
					fieldErrors: {
						username: [message ?? "Error onboarding"],
					},
				}),
			});
		}

		return redirectTo ? redirect(redirectTo) : redirect("/dashboard");
	}
	return Response.json({
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
