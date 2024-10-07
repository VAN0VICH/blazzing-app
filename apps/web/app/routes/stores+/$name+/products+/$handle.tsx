import type { Routes } from "@blazzing-app/functions";
import type { Product, Variant } from "@blazzing-app/validators/client";
import type { LoaderFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData, useNavigate, useParams } from "@remix-run/react";
import { hc } from "hono/client";
import React from "react";
import { useSubscribe } from "replicache-react";
import { StoreProductOverview } from "~/components/templates/product/store-product-overview";
import { useRequestInfo } from "~/hooks/use-request-info";
import { useReplicache } from "~/zustand/replicache";
import { useMarketplaceStore } from "~/zustand/store";

type LoaderData = {
	product: Product;
};

export const loader: LoaderFunction = async ({ context, params }) => {
	const handle = params.handle;
	if (!handle) {
		throw new Response(null, {
			status: 404,
			statusText: "Not Found",
		});
	}
	const client = hc<Routes>(context.cloudflare.env.WORKER_URL);
	const productResponse = await client.product.handle.$get({
		query: {
			handle,
		},
	});
	if (productResponse.ok) {
		const { result: product } = await productResponse.json();

		if (!product) {
			throw new Response(null, {
				status: 404,
				statusText: "Not Found",
			});
		}
		return json(
			{
				product,
			},
			{ headers: { "Cache-Control": "public, max-age=31536000" } },
		);
	}
	throw new Response(null, {
		status: 404,
		statusText: "Not Found",
	});
};

export default function Page() {
	const { userContext } = useRequestInfo();
	const params = useParams();
	const { product: serverProduct } = useLoaderData<LoaderData>();
	const cartID = userContext.cartID;
	const navigate = useNavigate();
	const isInitialized = useMarketplaceStore((state) => state.isInitialized);
	const rep = useReplicache((state) => state.marketplaceRep);

	const baseVariant = useSubscribe(
		rep,
		async (tx) => {
			if (!params.handle) return undefined;
			const result = await tx
				.scan({
					indexName: "handle",
					start: {
						key: [params.handle],
					},
					limit: 1,
				})
				.entries()
				.toArray();

			const [item] = result;
			return item?.[1] as Variant | undefined;
		},
		{ dependencies: [], default: undefined },
	);
	const productMap = useMarketplaceStore((state) => state.productMap);
	const product = productMap.get(baseVariant?.productID ?? serverProduct.id);

	const variants = useMarketplaceStore((state) =>
		state.variants.filter(
			(v) => v.productID === product?.id && v.id !== product?.baseVariantID,
		),
	);
	const [selectedVariantHandle, setSelectedVariantHandle] =
		React.useState<string>();

	const selectedVariant = selectedVariantHandle
		? variants.find((v) => v.handle === selectedVariantHandle)
		: undefined;
	return (
		<main className="flex w-full justify-center relative">
			{isInitialized && !product ? (
				<h1 className="font-freeman text-3xl mt-80 text-white dark:text-black">
					Product does not exist or has been deleted.
				</h1>
			) : (
				<StoreProductOverview
					product={product}
					variants={variants}
					selectedVariant={selectedVariant}
					setVariantIDOrHandle={setSelectedVariantHandle}
					selectedVariantIDOrHandle={selectedVariantHandle}
					cartID={cartID}
					baseVariant={baseVariant}
				/>
			)}
		</main>
	);
}
