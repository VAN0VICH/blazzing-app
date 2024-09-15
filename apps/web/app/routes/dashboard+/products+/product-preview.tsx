import type { Product } from "@blazzing-app/validators/client";
import { Box } from "@radix-ui/themes";
import { StoreProductOverview } from "~/components/templates/product/store-product-overview";

interface ProductPreviewProps {
	product: Product | undefined;
	setView: (value: "preview" | "input") => void;
}
const ProductPreview = ({ product, setView }: ProductPreviewProps) => {
	console.log("product", product);
	return (
		<Box width="100%" height="100%" position="relative">
			<StoreProductOverview
				product={undefined}
				variants={[]}
				selectedVariant={undefined}
				setVariantIDOrHandle={() => {}}
				selectedVariantIDOrHandle={undefined}
				isDashboard={true}
				baseVariant={undefined}
				setView={setView}
			/>
		</Box>
	);
};
export { ProductPreview };
