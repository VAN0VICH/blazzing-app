import { useEffect } from "react";
import { Replicache } from "replicache";

import { useReplicache } from "~/zustand/replicache";
import { DashboardMutators } from "@blazzing-app/replicache";
import { hc } from "hono/client";
import type { Routes } from "@blazzing-app/functions";
import { useSession } from "~/hooks/use-session";

function MarketplaceReplicacheProvider({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const marketplaceRep = useReplicache((state) => state.marketplaceRep);
	const setMarketplaceRep = useReplicache((state) => state.setMarketplaceRep);
	const session = useSession();

	useEffect(() => {
		if (marketplaceRep) {
			return;
		}

		const client = hc<Routes>(window.ENV.WORKER_URL);

		const r = new Replicache({
			name: "marketplace",
			licenseKey: window.ENV.REPLICACHE_KEY,
			mutators: DashboardMutators,
			pullInterval: null,
			indexes: {
				handle: {
					allowEmpty: true,
					jsonPointer: "/handle",
				},
			},
			//@ts-ignore
			puller: async (req) => {
				console.log("request", req);
				const response = await client.replicache.pull.$post(
					{
						//@ts-ignore
						json: req,
						query: {
							spaceID: "marketplace" as const,
						},
					},
					{
						headers: {
							...(session && { Authorization: `Bearer ${session.id}` }),
							"x-publishable-key": window.ENV.BLAZZING_PUBLISHABLE_KEY,
						},
					},
				);

				return {
					response: response.status === 200 ? await response.json() : undefined,
					httpRequestInfo: {
						httpStatusCode: response.status,
						errorMessage: response.status === 200 ? "" : response.statusText,
					},
				};
			},
			pusher: async (req) => {
				const response = await client.replicache.push.$post(
					{
						//@ts-ignore
						json: req,
						query: {
							spaceID: "marketplace" as const,
						},
					},
					{
						headers: {
							...(session && { Authorization: `Bearer ${session.id}` }),
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
		setMarketplaceRep(r);
	}, [marketplaceRep, setMarketplaceRep, session]);
	return <>{children}</>;
}

export { MarketplaceReplicacheProvider };
