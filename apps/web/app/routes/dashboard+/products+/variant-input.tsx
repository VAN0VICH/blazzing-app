import { cn } from "@blazzing-app/ui";
import { Ping } from "@blazzing-app/ui/ping";
import type { Product, Variant } from "@blazzing-app/validators/client";
import { Badge, Box, Flex, Grid } from "@radix-ui/themes";
import { Attributes } from "./input/product-attributes";
import { Media } from "./input/product-media";
import { Organize } from "./input/product-organize";
import { Pricing } from "./input/product-pricing";
import Stock from "./input/product-stock";
import { VariantInfo } from "./input/variant-info";

interface ProductVariantProps {
	variant: Variant | undefined;
	updateVariant: () => Promise<void>;
	product: Product | undefined;
}

const VariantInput = ({
	variant,
	product,
	updateVariant,
}: ProductVariantProps) => {
	return (
		<main className="relative flex flex-col min-h-screen pb-20 max-w-7xl w-full gap-3 min-[1200px]:flex min-[1200px]:flex-row min-w-[15rem] px-3">
			<div className="w-full flex flex-col lg:min-w-[44rem] xl:max-w-[50rem]">
				<Flex align="center" justify="between" height="100px">
					<Badge color={(variant?.quantity ?? 0) <= 0 ? "red" : "jade"}>
						<Ping
							className={cn("bg-jade-9", {
								"bg-red-9": (variant?.quantity ?? 0) <= 0,
							})}
						/>
						{(variant?.quantity ?? 0) > 0 ? "In stock" : "Out of stock"}
					</Badge>
				</Flex>
				<Grid gap="3">
					<VariantInfo variant={variant} updateVariant={updateVariant} />
					<Media images={variant?.images ?? []} variantID={variant?.id} />
					<Stock variant={variant} updateVariant={updateVariant} />
				</Grid>
			</div>

			<Grid className="min-[1200px]:max-w-[25rem]">
				<Box className="h-16" />
				<Grid gap="3" className="order-2 w-full">
					<Pricing
						isPublished={product?.status === "published"}
						variantID={variant?.id}
						prices={variant?.prices ?? []}
					/>
					<Organize product={product} />
					<Attributes variant={variant} />
				</Grid>
			</Grid>
		</main>
	);
};
export { VariantInput };
