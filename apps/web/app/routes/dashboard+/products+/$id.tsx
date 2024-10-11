import { Box, Flex } from "@radix-ui/themes";
import { useParams } from "@remix-run/react";
import { useState } from "react";
import { useDashboardStore } from "~/zustand/store";
import { ProductInput } from "./product-input";
import { ProductPreview } from "./product-preview";

function ProductRoute() {
	const params = useParams();
	const variantMap = useDashboardStore((state) => state.variantMap);
	const productMap = useDashboardStore((state) => state.productMap);
	const product = productMap.get(params.id!);
	const [view, setView] = useState<"input" | "preview">("input");
	if (!product) {
		return null;
	}

	const baseVariant = variantMap.get(product.baseVariantID);

	return (
		<Box
			width="100%"
			height="100%"
			position="relative"
			className="pb-20 lg:pb-3"
		>
			<Flex justify="center" position="relative">
				{view === "input" ? (
					<ProductInput
						setView={setView}
						productID={params.id!}
						product={product}
						baseVariant={baseVariant}
					/>
				) : (
					baseVariant && (
						<ProductPreview baseVariant={baseVariant} setView={setView} />
					)
				)}
			</Flex>
		</Box>
	);
}

export default ProductRoute;
