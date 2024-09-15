import { parseWithZod } from "@conform-to/zod";
import { useFetchers, useRouteLoaderData } from "@remix-run/react";
import type { RootLoaderData } from "~/root";
import { PreferencesSchema, type Preferences } from "~/validators/state";
import { useHints } from "./use-hints";
export function useUserPreferences(): Preferences {
	const data = useRouteLoaderData<RootLoaderData>("root");
	const hints = useHints();
	const optimisticUpdates = useOptimisticUserPreferences();
	return {
		...(data?.requestInfo.userPrefs as Preferences),
		theme:
			optimisticUpdates?.theme ??
			data?.requestInfo.userPrefs.theme ??
			hints.theme,
		...(optimisticUpdates?.accentColor && {
			accentColor: optimisticUpdates.accentColor,
		}),
		...(optimisticUpdates?.scaling && { scaling: optimisticUpdates.scaling }),
		...(optimisticUpdates?.grayColor && {
			grayColor: optimisticUpdates.grayColor,
		}),
	};
}

export function useOptimisticUserPreferences() {
	const fetchers = useFetchers();
	const preferences = fetchers.find(
		(f) => f.formAction === "/action/set-preferences",
	);
	if (preferences?.formData) {
		const submission = parseWithZod(preferences.formData, {
			schema: PreferencesSchema,
		});

		if (submission.status === "success") {
			return submission.value;
		}
	}
}
