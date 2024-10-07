import type { Routes } from "@blazzing-app/functions";
import { GlobalMutators } from "@blazzing-app/replicache";
import { hc } from "hono/client";
import { useEffect } from "react";
import { Replicache } from "replicache";
import { useRequestInfo } from "~/hooks/use-request-info";
import { useSession } from "~/hooks/use-session";
import { useReplicache } from "~/zustand/replicache";

export function GlobalReplicacheProvider({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const globalRep = useReplicache((state) => state.globalRep);
	const setGlobalRep = useReplicache((state) => state.setGlobalRep);
	const { userContext } = useRequestInfo();
	const { cartID, authUser } = userContext;
	const session = useSession();

	useEffect(() => {
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
							...(session && { Authorization: `Bearer ${session.id}` }),
							...(cartID && { "x-cart-id": cartID }),
							...(authUser?.userID && { "x-user-id": authUser.userID }),
						},
					},
				);

				return {
					response: response.status === 200 ? await response.json() : undefined,
					httpRequestInfo: {
						httpStatusCode: response.status,
						errorMessage: response.statusText,
					},
				};
			},
			pusher: async (req) => {
				const response = await client.replicache.push.$post(
					{
						//@ts-ignore
						json: req,
						query: {
							spaceID: "global" as const,
						},
					},
					{
						...(session && {
							headers: {
								Authorization: `Bearer ${session.id}`,
							},
						}),
					},
				);
				return {
					httpRequestInfo: {
						httpStatusCode: response.status,
						errorMessage: response.statusText,
					},
				};
			},
		});
		setGlobalRep(r);
	}, [globalRep, setGlobalRep, cartID, authUser, session]);

	return <>{children}</>;
}
