import type { Routes } from "@blazzing-app/functions";
import { DashboardMutators } from "@blazzing-app/replicache";
import { hc } from "hono/client";
import { useEffect } from "react";
import { Replicache } from "replicache";
import { useSession } from "~/hooks/use-session";
import { useReplicache } from "~/zustand/replicache";

function DashboardReplicacheProvider({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const dashboardRep = useReplicache((state) => state.dashboardRep);
	const setDashboardRep = useReplicache((state) => state.setDashboardRep);
	const session = useSession();

	useEffect(() => {
		if (dashboardRep || !session) {
			return;
		}
		const client = hc<Routes>(window.ENV.WORKER_URL);

		const r = new Replicache({
			name: "dashboard",
			licenseKey: window.ENV.REPLICACHE_KEY,
			mutators: DashboardMutators,
			pullInterval: null,

			//@ts-ignore
			puller: async (req) => {
				const response = await client.replicache.pull.$post(
					{
						//@ts-ignore
						json: req,
						query: {
							spaceID: "dashboard" as const,
						},
					},
					{
						headers: {
							Authorization: `Bearer ${session.id}`,
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
							spaceID: "dashboard" as const,
						},
					},
					{
						headers: {
							Authorization: `Bearer ${session.id}`,
						},
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
		setDashboardRep(r);
	}, [dashboardRep, setDashboardRep, session]);
	return <>{children}</>;
}

export { DashboardReplicacheProvider };
