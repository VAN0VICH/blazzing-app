import type { Product } from "@blazzing-app/validators/client";
import { Box } from "@radix-ui/themes";
import React from "react";
import { StoreProductOverview } from "~/components/templates/product/store-product-overview";
import { useDashboardStore } from "~/zustand/store";

interface ProductPreviewProps {
	product: Product | undefined;
	setView: (value: "preview" | "input") => void;
}
const ProductPreview = ({ product, setView }: ProductPreviewProps) => {
	const variantMap = useDashboardStore((state) => state.variantMap);
	const variants = useDashboardStore((state) =>
		state.variants.filter(
			(v) => v.productID === product?.id && v.id !== product?.baseVariantID,
		),
	);
	const baseVariant = variantMap.get(product?.baseVariantID ?? "");

	const [selectedVariantID, setSelectedVariantID] = React.useState<string>();

	const selectedVariant = selectedVariantID
		? variants.find((v) => v.id === selectedVariantID)
		: undefined;
	console.log("baseVariant", baseVariant);
	console.log("product", product);
	return (
		<Box width="100%" height="100%" position="relative" p="3">
			<StoreProductOverview
				product={product}
				variants={variants}
				selectedVariant={selectedVariant}
				setVariantIDOrHandle={setSelectedVariantID}
				selectedVariantIDOrHandle={selectedVariantID}
				isDashboard={true}
				baseVariant={baseVariant}
				setView={setView}
			/>
		</Box>
	);
};
export { ProductPreview };
