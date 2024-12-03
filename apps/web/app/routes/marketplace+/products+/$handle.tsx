import type { Routes } from "@blazzing-app/functions";
import { cn } from "@blazzing-app/ui";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	useCarousel,
	type CarouselApi,
} from "@blazzing-app/ui/carousel";
import { Icons } from "@blazzing-app/ui/icons";
import type { Variant } from "@blazzing-app/validators";
import { Flex, Heading, IconButton } from "@radix-ui/themes";
import type { LoaderFunction } from "@remix-run/cloudflare";
import {
	useLoaderData,
	useNavigate,
	useParams,
	useSearchParams,
} from "@remix-run/react";
import { hc } from "hono/client";
import React from "react";
import { useSubscribe } from "replicache-react";
import { ProductOverview } from "~/components/templates/product/product-overview";
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
	//@ts-ignore
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
export default function ProductPage() {
	const { userContext } = useRequestInfo();
	const params = useParams();
	const [searchParams] = useSearchParams();
	const { variant: serverVariant } = useLoaderData<LoaderData>();
	const { cartID, tempUserID } = userContext;
	const navigate = useNavigate();
	const isInitialized = useMarketplaceStore((state) => state.isInitialized);
	const rep = useReplicache((state) => state.marketplaceRep);

	const [currentPage, setCurrentPage] = React.useState(1);

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
		{ dependencies: [params.handle], default: undefined },
	);

	const variants = useMarketplaceStore((state) =>
		state.variants.filter((v) => v.productID === variant?.productID),
	);
	const feedVariants = useMarketplaceStore((state) =>
		state.products
			.map((p) => {
				if (p.id === variant?.productID) return undefined;
				return p.baseVariant;
			})
			.filter((v) => v !== undefined),
	);

	const [selectedVariantHandle, _setSelectedVariantHandle] =
		React.useState<string>(params.handle!);
	const setSelectedVariantHandle = React.useCallback(
		(handle: string) => {
			_setSelectedVariantHandle(handle);
			window.history.replaceState(
				{},
				"",
				`/marketplace/products/${handle}?storeID=${searchParams.get("storeID")}`,
			);
		},
		[searchParams],
	);

	const selectedVariant = React.useMemo(
		() =>
			variants.find((v) => v.handle === selectedVariantHandle) ??
			variant ??
			serverVariant,
		[selectedVariantHandle, variants, variant, serverVariant],
	);

	const [api, setApi] = React.useState<CarouselApi>();

	React.useEffect(() => {
		if (!api) {
			return;
		}

		const handleSelect = () => {
			const newPage = api.selectedScrollSnap() + 1;
			setCurrentPage(newPage);
		};

		api.on("select", handleSelect);

		return () => {
			api.off("select", handleSelect);
		};
	}, [api]);

	React.useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape" || event.key === "Esc") {
				// Handle Escape key press here
				navigate("/marketplace", {
					preventScrollReset: true,
					replace: true,
				});
			}
		};

		window.addEventListener("keydown", handleKeyDown);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [navigate]);

	React.useEffect(() => {
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = "auto";
		};
	}, []);

	React.useEffect(() => {
		if (
			currentPage === 1 &&
			!variants.some((v) => v.handle === selectedVariantHandle)
		) {
			if (selectedVariant) setSelectedVariantHandle(selectedVariant.handle!);
		}
	}, [
		currentPage,
		selectedVariant,
		selectedVariantHandle,
		setSelectedVariantHandle,
		variants,
	]);

	const elementRef = React.useRef(null);

	return (
		<Carousel orientation="vertical" setApi={setApi}>
			<NavigationButtons />
			<div
				ref={elementRef}
				className="fixed inset-0 z-40 w-screen h-screen max-h-screen bg-black/80 dark:bg-zinc-900/80 backdrop-blur-sm overflow-y-scroll"
			>
				<main className="flex w-full justify-center relative">
					<CarouselContent className="shadow-none w-screen h-screen">
						<CarouselItem className="border-accent-8 border-b-[0.1px]">
							{isInitialized && !variant ? (
								<Heading
									size="7"
									className="font-freeman mt-80 text-white dark:text-black"
								>
									Product does not exist or has been deleted.
								</Heading>
							) : (
								<ProductOverview
									baseVariantIDOrHandle={
										selectedVariant?.product?.baseVariant.handle!
									}
									variants={variants}
									selectedVariant={selectedVariant ?? variant ?? serverVariant}
									setVariantIDOrHandle={setSelectedVariantHandle}
									selectedVariantIDOrHandle={selectedVariantHandle}
									cartID={cartID}
									tempUserID={tempUserID}
								/>
							)}
						</CarouselItem>
						{feedVariants.map((p, index) => {
							return (
								<CarouselItem
									key={p.id}
									className={cn("shadow-none flex justify-center")}
								>
									<Page
										{...(cartID && { cartID })}
										currentPage={currentPage}
										index={index + 2}
										selectedVariantHandle={selectedVariantHandle}
										setSelectedVariantHandle={setSelectedVariantHandle}
										productVariant={p}
									/>
								</CarouselItem>
							);
						})}
					</CarouselContent>
				</main>
			</div>
		</Carousel>
	);
}

const NavigationButtons = () => {
	const { scrollNext, canScrollNext, scrollPrev, canScrollPrev } =
		useCarousel();
	React.useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "ArrowDown") {
				scrollNext();
			}
			if (event.key === "ArrowUp") {
				scrollPrev();
			}
		};

		window.addEventListener("keydown", handleKeyDown);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [scrollNext, scrollPrev]);

	return (
		<Flex
			direction="column"
			gap="3"
			className="fixed bottom-3 z-50 right-3 hidden lg:flex"
		>
			<IconButton
				variant="classic"
				size="4"
				disabled={!canScrollPrev}
				onClick={scrollPrev}
			>
				<Icons.Up />
			</IconButton>
			<IconButton
				variant="classic"
				size="4"
				disabled={!canScrollNext}
				onClick={scrollNext}
			>
				<Icons.Down />
			</IconButton>
		</Flex>
	);
};

const Page = ({
	productVariant,
	cartID,
	currentPage,
	index,
	selectedVariantHandle,
	setSelectedVariantHandle,
}: {
	productVariant: Variant;
	cartID?: string;
	currentPage: number;
	index: number;
	selectedVariantHandle: string;
	setSelectedVariantHandle: (handle: string) => void;
}) => {
	const variants = useMarketplaceStore((state) =>
		state.variants.filter((v) => v.product.id === productVariant?.productID),
	);
	const selectedVariant = React.useMemo(
		() =>
			variants.find((v) => v.handle === selectedVariantHandle) ??
			productVariant,
		[selectedVariantHandle, variants, productVariant],
	);
	React.useEffect(() => {
		if (
			currentPage === index &&
			selectedVariantHandle !== productVariant.handle &&
			!variants.some((v) => v.handle === selectedVariantHandle)
		) {
			setSelectedVariantHandle(productVariant.handle!);
		}
	}, [
		currentPage,
		index,
		productVariant,
		selectedVariantHandle,
		setSelectedVariantHandle,
		variants,
	]);

	return (
		<ProductOverview
			variants={variants}
			selectedVariant={selectedVariant ?? productVariant}
			setVariantIDOrHandle={setSelectedVariantHandle}
			selectedVariantIDOrHandle={selectedVariantHandle}
			cartID={cartID}
			baseVariantIDOrHandle={
				productVariant.product?.baseVariant.handle ?? undefined
			}
		/>
	);
};
