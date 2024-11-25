import type { Variant } from "../../../../../../packages/validators/src/store-entities";
import { Box } from "@radix-ui/themes";
import React from "react";
import { StoreProductOverview } from "~/components/templates/product/store-product-overview";
import { useDashboardStore } from "~/zustand/store";

interface ProductPreviewProps {
	baseVariant: Variant;
	setView: (value: "preview" | "input") => void;
}
const ProductPreview = ({ baseVariant, setView }: ProductPreviewProps) => {
	const variants = useDashboardStore((state) =>
		state.variants.filter((v) => v.productID === baseVariant?.id),
	);

	const [selectedVariantID, setSelectedVariantID] = React.useState<string>(
		baseVariant.id,
	);

	const selectedVariant = React.useMemo(
		() => variants.find((v) => v.id === selectedVariantID) ?? baseVariant,
		[baseVariant, selectedVariantID, variants],
	);
	return (
		<Box width="100%" height="100%" position="relative" p="3">
			<StoreProductOverview
				variants={variants}
				selectedVariant={selectedVariant}
				setVariantIDOrHandle={setSelectedVariantID}
				selectedVariantIDOrHandle={selectedVariantID}
				isDashboard={true}
				baseVariantIDOrHandle={selectedVariant?.product?.baseVariantID}
				setView={setView}
			/>
		</Box>
	);
};
export { ProductPreview };
