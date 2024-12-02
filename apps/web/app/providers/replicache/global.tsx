import type { Routes } from "@blazzing-app/functions";
import { GlobalMutators } from "@blazzing-app/replicache";
import { hc } from "hono/client";
import { useEffect } from "react";
import { Replicache } from "replicache";
import { useRequestInfo } from "~/hooks/use-request-info";
import { useReplicache } from "~/zustand/replicache";
import { useAuth } from "@clerk/remix";

export function GlobalReplicacheProvider({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const globalRep = useReplicache((state) => state.globalRep);
	const setGlobalRep = useReplicache((state) => state.setGlobalRep);
	const { userContext } = useRequestInfo();
	const { getToken } = useAuth();
	const { cartID, tempUserID } = userContext;

	useEffect(() => {
		const setupReplicache = async () => {
			if (globalRep) {
				return;
			}

			const client = hc<Routes>(window.ENV.WORKER_URL);

			const r = new Replicache({
				name: "global",
				licenseKey: window.ENV.REPLICACHE_KEY,
				mutators: GlobalMutators,
				pullInterval: null,
				//@ts-ignore

				puller: async (req) => {
					const token = await getToken();
					const response = await client.replicache.pull.$post(
						{
							//@ts-ignore
							json: req,
							query: {
								spaceID: "global" as const,
							},
						},
						{
							headers: {
								"Content-Type": "application/json",
								"x-publishable-key": window.ENV.BLAZZING_PUBLISHABLE_KEY,
								...(token && { Authorization: `Bearer ${token}` }),
								...(cartID && { "x-cart-id": cartID }),
								...(tempUserID && { "x-temp-user-id": tempUserID }),
							},
						},
					);

					return {
						response:
							response.status === 200 ? await response.json() : undefined,
						httpRequestInfo: {
							httpStatusCode: response.status,
							errorMessage: response.status === 200 ? "" : response.statusText,
						},
					};
				},
				pusher: async (req) => {
					const token = await getToken();
					const response = await client.replicache.push.$post(
						{
							//@ts-ignore
							json: req,
							query: {
								spaceID: "global" as const,
							},
						},
						{
							headers: {
								...(token && { Authorization: `Bearer ${token}` }),
								"x-publishable-key": window.ENV.BLAZZING_PUBLISHABLE_KEY,
							},
						},
					);
					return {
						httpRequestInfo: {
							httpStatusCode: response.status,
							errorMessage: response.status === 200 ? "" : response.statusText,
						},
					};
				},
			});
			setGlobalRep(r);
		};

		setupReplicache();
	}, [globalRep, setGlobalRep, cartID, getToken, tempUserID]);

	return <>{children}</>;
}
