import { parseWithZod } from "@conform-to/zod";
import { useFetchers } from "@remix-run/react";
import { useRequestInfo } from "~/hooks/use-request-info";
import { AccentColorSchema } from "~/validators/state";
/**
 * @returns the user's theme preference, or the client hint theme if the user
 * has not set a preference.
 */
export function useAccentColor() {
	const requestInfo = useRequestInfo();
	const optimisticMode = useOptimisticAccentMode();
	return optimisticMode ?? requestInfo.userPrefs.accentColor ?? "ruby";
}

/**
 * If the user's changing their theme mode preference, this will return the
 * value it's being changed to.
 */
export function useOptimisticAccentMode() {
	const fetchers = useFetchers();
	const themeFetcher = fetchers.find(
		(f) => f.formAction === "/action/set-accent-color",
	);

	console.log("opt", themeFetcher);
	if (themeFetcher?.formData) {
		const submission = parseWithZod(themeFetcher.formData, {
			schema: AccentColorSchema,
		});

		if (submission.status === "success") {
			return submission.value.color;
		}
	}
}
