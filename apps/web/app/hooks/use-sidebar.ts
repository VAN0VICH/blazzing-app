import { parseWithZod } from "@conform-to/zod";
import { useFetchers } from "@remix-run/react";
import { useRequestInfo } from "~/hooks/use-request-info";
import { SidebarStateSchema } from "~/validators/state";
/**
 * @returns the user's theme preference, or the client hint theme if the user
 * has not set a preference.
 */
export function useSidebarState() {
	const requestInfo = useRequestInfo();
	const optimisticMode = useOptimisticSidebarMode();
	console.log("sidebar", optimisticMode);
	return optimisticMode ?? requestInfo.userPrefs.sidebarState ?? "closed";
}

/**
 * If the user's changing their theme mode preference, this will return the
 * value it's being changed to.
 */
export function useOptimisticSidebarMode() {
	const fetchers = useFetchers();
	const themeFetcher = fetchers.find(
		(f) => f.formAction === "/action/set-sidebar",
	);

	console.log("opt", themeFetcher);
	if (themeFetcher?.formData) {
		const submission = parseWithZod(themeFetcher.formData, {
			schema: SidebarStateSchema,
		});

		if (submission.status === "success") {
			return submission.value.sidebarState;
		}
	}
}
