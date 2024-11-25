import type { Routes } from "@blazzing-app/functions";
import type { Store as StoreType } from "../../../../../../packages/validators/src/store-entities";
import { type LoaderFunction, json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { hc } from "hono/client";
import { StoreComponent } from "~/components/templates/store";
import { useMarketplaceStore } from "~/zustand/store";

type LoaderData = {
	store: StoreType;
	cartID: string | undefined;
};
export const loader: LoaderFunction = async (args) => {
	const name = args.params.name;
	const { context } = args;
	if (!name) {
		throw new Response(null, {
			status: 404,
			statusText: "Not Found",
		});
	}
	const client = hc<Routes>(context.cloudflare.env.WORKER_URL);
	const storeResponse = await client.store.name.$get(
		{
			query: {
				name,
			},
		},
		{
			headers: {
				"x-publishable-key": context.cloudflare.env.BLAZZING_PUBLISHABLE_KEY,
			},
		},
	);
	if (storeResponse.ok) {
		const { result: store } = await storeResponse.json();

		if (!store) {
			throw new Response(null, {
				status: 404,
				statusText: "Not Found",
			});
		}
		return json(
			{
				store,
			},
			{ headers: { "Cache-Control": "public, max-age=31536000" } },
		);
	}
	throw new Response(null, {
		status: 404,
		statusText: "Not Found",
	});
};

export default function Store() {
	const isInitialized = useMarketplaceStore((state) => state.isInitialized);
	const { store: serverStore } = useLoaderData<LoaderData>();
	const storeMap = useMarketplaceStore((state) => state.storeMap);
	const store = storeMap.get(serverStore.id);
	const products = useMarketplaceStore((state) =>
		state.products.filter((product) => product.storeID === serverStore.id),
	);
	return (
		<StoreComponent
			isInitialized={isInitialized}
			products={products ?? serverStore.products}
			store={store ?? serverStore}
		/>
	);
}
