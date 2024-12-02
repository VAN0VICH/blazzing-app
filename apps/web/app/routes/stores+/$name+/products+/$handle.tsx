import type { Routes } from "@blazzing-app/functions";
import type { Variant } from "@blazzing-app/validators";
import { Flex, Heading } from "@radix-ui/themes";
import type { LoaderFunction } from "@remix-run/cloudflare";
import { useLoaderData, useParams, useSearchParams } from "@remix-run/react";
import { hc } from "hono/client";
import React from "react";
import { useSubscribe } from "replicache-react";
import { StoreProductOverview } from "~/components/templates/product/store-product-overview";
import { useRequestInfo } from "~/hooks/use-request-info";
import { useReplicache } from "~/zustand/replicache";
import { useMarketplaceStore } from "~/zustand/store";

type LoaderData = {
	variant: Variant;
};

export const loader: LoaderFunction = async ({ context, params, request }) => {
	const handle = params.handle;
	const url = new URL(request.url);
	const searchParams = url.searchParams;
	const storeID = searchParams.get("storeID");
	if (!handle) {
		throw new Response(null, {
			status: 404,
			statusText: "Not Found",
		});
	}
	if (!storeID) {
		throw new Response(null, {
			status: 404,
			statusText: "Not Found",
		});
	}
	const client = hc<Routes>(context.cloudflare.env.WORKER_URL);
	const variantResponse = await client.variant.handle.$get(
		{
			query: {
				handle,
				storeID,
			},
		},
		{
			headers: {
				"x-publishable-key": context.cloudflare.env.BLAZZING_PUBLISHABLE_KEY,
			},
		},
	);
	if (variantResponse.ok) {
		const { result: variants } = await variantResponse.json();

		if (!variants[0]) {
			throw new Response(null, {
				status: 404,
				statusText: "Not Found",
			});
		}
		return Response.json(
			{
				variant: variants[0],
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
	const [searchParams] = useSearchParams();
	const { variant: serverVariant } = useLoaderData<LoaderData>();
	const cartID = userContext?.cartID;
	const isInitialized = useMarketplaceStore((state) => state.isInitialized);
	const rep = useReplicache((state) => state.marketplaceRep);

	const variant = useSubscribe(
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

	const variants = useMarketplaceStore((state) =>
		state.variants.filter((v) => v.productID === variant?.product?.id),
	);
	const [selectedVariantHandle, _setSelectedVariantHandle] =
		React.useState<string>(params.handle!);
	const setSelectedVariantHandle = React.useCallback(
		(handle: string) => {
			_setSelectedVariantHandle(handle);
			if (variant?.product?.store.name)
				window.history.replaceState(
					{},
					"",
					`/stores/${variant.product.store.name}/products/${handle}?storeID=${searchParams.get("storeID")}`,
				);
		},
		[variant, searchParams],
	);

	const selectedVariant = React.useMemo(
		() => variants.find((v) => v.handle === selectedVariantHandle) ?? variant,
		[selectedVariantHandle, variants, variant],
	);
	return (
		<Flex justify="center" position="relative" width="100%">
			{isInitialized && !variant ? (
				<Heading
					size="7"
					className="font-freeman mt-80 text-white dark:text-black"
				>
					Product does not exist or has been deleted.
				</Heading>
			) : (
				<StoreProductOverview
					baseVariantIDOrHandle={variant?.product?.baseVariant.handle!}
					variants={variants}
					selectedVariant={selectedVariant ?? serverVariant}
					setVariantIDOrHandle={setSelectedVariantHandle}
					selectedVariantIDOrHandle={selectedVariantHandle}
					cartID={cartID}
				/>
			)}
		</Flex>
	);
}
