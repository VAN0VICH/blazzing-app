import { StoreProductOverview } from "~/components/templates/product/store-product-overview";
import { product } from "~/temp/mock-entities";

export default function Page() {
	const isInitialized = true;
	return (
		<main className="flex w-full justify-center relative">
			{isInitialized && !product ? (
				<h1 className="font-freeman text-3xl mt-80 text-white dark:text-black">
					Product does not exist or has been deleted.
				</h1>
			) : (
				<StoreProductOverview
					product={product}
					variants={[]}
					selectedVariant={undefined}
					setVariantIDOrHandle={() => {}}
					selectedVariantIDOrHandle={undefined}
					cartID={undefined}
					baseVariant={undefined}
				/>
			)}
		</main>
	);
}
