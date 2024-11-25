import { cn } from "@blazzing-app/ui";
import { Ping } from "@blazzing-app/ui/ping";
import type {
	Product,
	Variant,
} from "../../../../../../packages/validators/src/store-entities";
import { Badge, Box, Flex, Grid } from "@radix-ui/themes";
import { Attributes } from "./input/product-attributes";
import { Media } from "./input/product-media";
import { Pricing } from "./input/product-pricing";
import Stock from "./input/product-stock";
import { VariantInfo } from "./input/variant-info";
import type { UpdateVariant } from "@blazzing-app/validators";
import { useUserPreferences } from "~/hooks/use-user-preferences";

interface ProductVariantProps {
	variant: Variant | undefined;
	updateVariant: (props: UpdateVariant) => Promise<void>;
	product: Product | undefined;
}

const VariantInput = ({
	variant,
	product,
	updateVariant,
}: ProductVariantProps) => {
	const { accentColor } = useUserPreferences();
	return (
		<main className="relative flex flex-col min-h-screen pb-20 max-w-[1700px] w-full gap-3 min-[1200px]:flex min-[1200px]:flex-row min-w-[15rem] px-3">
			<Flex
				direction="column"
				width="100%"
				className="lg:min-w-[44rem] xl:max-w-[80rem]"
			>
				<Flex justify="between" align="center" className="h-14">
					<Badge
						size="3"
						color={
							(variant?.quantity ?? 0) <= 0 ? "red" : (accentColor ?? "ruby")
						}
					>
						<Ping
							className={cn("bg-accent-11", {
								"bg-red-11": (variant?.quantity ?? 0) <= 0,
							})}
						/>
						{(variant?.quantity ?? 0) <= 0 ? "Out of stock" : "In stock"}
					</Badge>
				</Flex>
				<Grid gap="3">
					<VariantInfo variant={variant} updateVariant={updateVariant} />
					<Media images={variant?.images ?? []} variantID={variant?.id} />
					<Stock variant={variant} updateVariant={updateVariant} />
				</Grid>
			</Flex>

			<Flex
				width="full"
				direction="column"
				className="w-full min-[1200px]:max-w-[28rem]"
			>
				<Box className="h-14 hidden min-[1200px]:block" />
				<Flex direction="column" gap="3" className="order-2 w-full">
					<Pricing
						isPublished={product?.status === "published"}
						variantID={variant?.id}
						prices={variant?.prices ?? []}
					/>
					<Attributes variant={variant} updateVariant={updateVariant} />
				</Flex>
			</Flex>
		</main>
	);
};
export { VariantInput };
