import { useRouteLoaderData } from "@remix-run/react";
import type { RootLoaderData } from "~/root";
import type { AccentColor, Theme } from "~/validators/state";
interface Preferences {
	theme: Theme;
	sidebarState: "open" | "closed";
	accentColor: AccentColor;
}
export function useUserPreferences(): Preferences {
	const data = useRouteLoaderData<RootLoaderData>("root");
	return data?.requestInfo.userPrefs as Preferences;
}
