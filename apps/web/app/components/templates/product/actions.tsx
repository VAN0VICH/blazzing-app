import { Icons } from "@blazzing-app/ui/icons";
import { ToggleGroup, ToggleGroupItem } from "@blazzing-app/ui/toggle-group";
import type {
	Product,
	PublishedProduct,
	PublishedVariant,
	Variant,
} from "@blazzing-app/validators/client";
import { Button, Flex, Grid } from "@radix-ui/themes";

const Actions = ({
	cartID,
	baseVariant,
	variants,
	selectedVariant,
	product,
	isDashboard,
	setIsShaking,
}: {
	cartID?: string;
	selectedVariant: PublishedVariant | Variant | undefined;
	baseVariant: PublishedVariant | Variant | undefined;
	variants: (PublishedVariant | Variant)[];
	product: PublishedProduct | Product | undefined;
	isDashboard?: boolean;
	setIsShaking: (value: boolean) => void;
}) => {
	console.log(
		cartID,
		baseVariant,
		variants,
		selectedVariant,
		product,
		isDashboard,
		setIsShaking,
	);

	return (
		<Grid py="4" gap="4" className=" border-b border-border ">
			<Flex gap="4" align="center" className="w-full">
				<SaveToBookmarks />
				<Button className="w-full max-w-[200px]" size="3" variant="classic">
					<Icons.Rocket className="size-4" strokeWidth={2} />
					Buy with one click
				</Button>
			</Flex>

			<Button className="w-full max-w-[257px]" size="3" variant="outline">
				<Icons.ShoppingCart className="size-4" strokeWidth={2} />
				Add to Cart
			</Button>
		</Grid>
	);
};
const SaveToBookmarks = () => {
	return (
		<ToggleGroup type="single">
			<ToggleGroupItem
				value="save"
				className="w-full aspect-square text-sm flex gap-2"
				onClick={(e) => e.stopPropagation()}
			>
				<Icons.Bookmark size={20} />
			</ToggleGroupItem>
		</ToggleGroup>
	);
};
export { Actions };
