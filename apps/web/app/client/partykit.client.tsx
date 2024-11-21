import type { Routes } from "@blazzing-app/functions";
import { hc } from "hono/client";
import usePartySocket from "partysocket/react";
import { useRequestInfo } from "~/hooks/use-request-info";
import { useSession } from "~/hooks/use-session";

import { useReplicache } from "~/zustand/replicache";

function PartykitProvider() {
	const dashboardRep = useReplicache((state) => state.dashboardRep);
	const globalRep = useReplicache((state) => state.globalRep);
	const marketplaceRep = useReplicache((state) => state.marketplaceRep);
	const { userContext } = useRequestInfo();
	const { cartID, authUser } = userContext;
	const client = hc<Routes>(window.ENV.WORKER_URL);
	const session = useSession();

	usePartySocket({
		// usePartySocket takes the same arguments as PartySocket.
		host: window.ENV.PARTYKIT_HOST, // or localhost:1999 in dev
		room: "global",

		// in addition, you can provide socket lifecycle event handlers
		// (equivalent to using ws.addEventListener in an effect hook)
		onOpen() {
			console.log("connected");
		},
		onMessage(e) {
			const subspaces = JSON.parse(e.data) as string[];
			console.log("message", subspaces);
			if (globalRep) {
				//@ts-ignore
				globalRep.puller = async (req) => {
					const response = await client.replicache.pull.$post(
						{
							//@ts-ignore
							json: req,
							query: {
								spaceID: "global" as const,
								subspaces,
							},
						},
						{
							headers: {
								Authorization: `Bearer ${session?.id}`,
								"x-publishable-key": window.ENV.BLAZZING_PUBLISHABLE_KEY,
								...(cartID && { "x-cart-id": cartID }),
								...(authUser?.userID && { "x-user-id": authUser.userID }),
								"Content-Type": "application/json",
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
				};
				globalRep.pull();
			}
		},
		onClose() {
			console.log("closed");
		},
		onError() {
			console.log("error");
		},
	});
	usePartySocket({
		// usePartySocket takes the same arguments as PartySocket.
		host: window.ENV.PARTYKIT_HOST, // or localhost:1999 in dev
		room: "dashboard",

		// in addition, you can provide socket lifecycle event handlers
		// (equivalent to using ws.addEventListener in an effect hook)
		onOpen() {
			console.log("connected");
		},
		onMessage(e) {
			const subspaces = JSON.parse(e.data) as string[];
			console.log("message", subspaces);
			if (dashboardRep && session) {
				//@ts-ignore
				dashboardRep.puller = async (req) => {
					const response = await client.replicache.pull.$post(
						{
							//@ts-ignore
							json: req,
							query: {
								spaceID: "dashboard" as const,
								subspaces,
							},
						},
						{
							headers: {
								Authorization: `Bearer ${session.id}`,
								"x-publishable-key": window.ENV.BLAZZING_PUBLISHABLE_KEY,
								"Content-Type": "application/json",
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
				};
				dashboardRep.pull();
			}
		},
		onClose() {
			console.log("closed");
		},
		onError() {
			console.log("error");
		},
	});

	usePartySocket({
		// usePartySocket takes the same arguments as PartySocket.
		host: window.ENV.PARTYKIT_HOST, // or localhost:1999 in dev
		room: "marketplace",

		// in addition, you can provide socket lifecycle event handlers
		// (equivalent to using ws.addEventListener in an effect hook)
		onOpen() {
			console.log("connected");
		},
		onMessage(e) {
			const subspaces = JSON.parse(e.data) as string[];
			console.log("message", subspaces);
			if (marketplaceRep) {
				//@ts-ignore
				dashboardRep.puller = async (req) => {
					const response = await client.replicache.pull.$post(
						{
							//@ts-ignore
							json: req,
							query: {
								spaceID: "marketplace" as const,
								subspaces,
							},
						},
						{
							headers: {
								Authorization: `Bearer ${session?.id}`,
								"x-publishable-key": window.ENV.BLAZZING_PUBLISHABLE_KEY,
								"Content-Type": "application/json",
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
				};
				marketplaceRep.pull();
			}
		},
		onClose() {
			console.log("closed");
		},
		onError() {
			console.log("error");
		},
	});

	return null;
}
export { PartykitProvider };
