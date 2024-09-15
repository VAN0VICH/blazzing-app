import { useNavigate, useSearchParams } from "@remix-run/react";
import React, { useEffect } from "react";
import { ProductOverview } from "~/components/templates/product/product-overview";
import { useIsElementScrolled } from "~/hooks/use-is-element-scrolled";
import { useRequestInfo } from "~/hooks/use-request-info";
import { product as mockProduct } from "~/temp/mock-entities";
export default function Page() {
	const { userContext } = useRequestInfo();
	const cartID = userContext.cartID;
	const navigate = useNavigate();
	const isInitialized = true;
	const product = mockProduct;

	const [searchParams, setSearchParams] = useSearchParams();
	const selectedVariantHandle = searchParams.get("variant") ?? undefined;
	const setSelectedVariantHandle = (handle: string | undefined) => {
		setSearchParams(
			(prev) => {
				const params = new URLSearchParams(prev);
				if (!handle) {
					params.delete("variant");
					return params;
				}
				params.set("variant", handle);
				return params;
			},
			{ preventScrollReset: true },
		);
	};

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape" || event.key === "Esc") {
				// Handle Escape key press here
				navigate("/marketplace", {
					preventScrollReset: true,
					unstable_viewTransition: true,
					replace: true,
				});
			}
		};

		window.addEventListener("keydown", handleKeyDown);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [navigate]);

	useEffect(() => {
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = "auto";
		};
	}, []);

	const elementRef = React.useRef(null);
	const isElementScrolled = useIsElementScrolled(elementRef);
	console.log("isElementScrolled", isElementScrolled);

	return (
		<div
			ref={elementRef}
			className="fixed inset-0 z-40 w-screen h-screen max-h-screen bg-black/80 dark:bg-zinc-900/80 backdrop-blur-sm overflow-y-scroll"
			onClick={() => {
				navigate("/marketplace", {
					preventScrollReset: true,
					unstable_viewTransition: true,
					replace: true,
				});
			}}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					e.stopPropagation();
					navigate("/marketplace", {
						preventScrollReset: true,
						unstable_viewTransition: true,
						replace: true,
					});
				}
			}}
		>
			<main className="flex w-full justify-center relative">
				{isInitialized && !product ? (
					<h1 className="font-freeman text-3xl mt-80 text-white dark:text-black">
						Product does not exist or has been deleted.
					</h1>
				) : (
					<ProductOverview
						product={undefined}
						variants={[]}
						selectedVariant={undefined}
						setVariantIDOrHandle={setSelectedVariantHandle}
						selectedVariantIDOrHandle={selectedVariantHandle}
						cartID={cartID}
						baseVariant={undefined}
						isScrolled={isElementScrolled}
					/>
				)}
			</main>
		</div>
	);
}
