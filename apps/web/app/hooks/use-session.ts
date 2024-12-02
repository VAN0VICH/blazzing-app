import type { AuthSession } from "@blazzing-app/validators";
import { useRouteLoaderData } from "@remix-run/react";
import type { RootLoaderData } from "~/root";
export function useSession(): AuthSession | null {
	const data = useRouteLoaderData<RootLoaderData>("root");
	return data?.requestInfo?.userContext?.userSession ?? null;
}
