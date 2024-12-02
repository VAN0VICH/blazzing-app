import { parseWithZod } from "@conform-to/zod";
import { invariant } from "@epic-web/invariant";
import { useFetchers, useRouteLoaderData } from "@remix-run/react";
import { z } from "zod";
import type { RootLoaderData } from "~/root";

/**
 * @returns the request info from the root loader
 */
export function useRequestInfo() {
	const data = useRouteLoaderData<RootLoaderData>("root");
	console.log("data in route router loader", data);
	invariant(data?.requestInfo, "No requestInfo found in root loader");
	const optimisticUserContext = useOptimisticUserContextMode();

	return {
		...data?.requestInfo,
		userContext: { ...data?.requestInfo.userContext, ...optimisticUserContext },
	};
}

/**
 * If the user's changing their userContext, this will return the
 * value it's being changed to.
 */
export function useOptimisticUserContextMode() {
	const fetchers = useFetchers();
	const userContext = fetchers.find(
		(f) =>
			f.formAction === "/action/set-cart-id" ||
			f.formAction === "/action/logout",
	);
	if (userContext?.formData) {
		const submission = parseWithZod(userContext?.formData, {
			schema: z.object({
				cartID: z.optional(z.string()),
			}),
		});

		if (submission.status === "success") {
			return submission.value;
		}
	}
}
