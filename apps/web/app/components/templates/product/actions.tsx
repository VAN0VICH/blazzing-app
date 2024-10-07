import { Icons } from "@blazzing-app/ui/icons";
import { ToggleGroup, ToggleGroupItem } from "@blazzing-app/ui/toggle-group";
import { generateID } from "@blazzing-app/utils";
import type {
	Product,
	PublishedProduct,
	PublishedVariant,
	Variant,
} from "@blazzing-app/validators/client";
import { Box, Button, Flex, Grid } from "@radix-ui/themes";
import { useFetcher } from "@remix-run/react";
import React from "react";
import { useReplicache } from "~/zustand/replicache";
import { useCartState } from "~/zustand/state";
import { useGlobalStore } from "~/zustand/store";

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
	const fetcher = useFetcher();
	const rep = useReplicache((state) => state.globalRep);
	const items = useGlobalStore((state) => state.lineItems);

	const itemsIDs = new Map(items.map((i) => [i.variantID, i]));
	const { setOpened } = useCartState();
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const addToCart = React.useCallback(
		async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
			e.stopPropagation();
			if (!product || !baseVariant || isDashboard) return;

			if (variants.length > 0 && !selectedVariant) {
				setIsShaking(true);
				setTimeout(setIsShaking, 250);

				return;
			}

			const variant = selectedVariant ?? baseVariant;
			const item = itemsIDs.get(variant.id);
			if (item) {
				await rep?.mutate.updateLineItem({
					id: item.id,
					quantity: item.quantity + 1,
				});
				return setOpened(true);
			}
			const newID = generateID({ prefix: "line_item" });
			const newCartID = generateID({ prefix: "cart" });

			if (!cartID) {
				fetcher.submit(
					{ cartID: newCartID },
					{ method: "POST", action: "/action/set-cart-id" },
				);
			}

			await rep?.mutate.createLineItem({
				lineItem: {
					id: newID,
					cartID: cartID ?? newCartID,
					title: variant.title ?? "",
					quantity: 1,
					createdAt: new Date().toISOString(),
					//@ts-ignore
					variant,
					variantID: variant.id,
					productID: product.id,
					product,
					storeID: product.storeID ?? "",
				},
				...(!cartID && {
					newCartID,
				}),
			});

			return setOpened(true);
		},
		[cartID, product, baseVariant, rep, isDashboard, itemsIDs, setOpened],
	);
	return (
		<Grid py="4" gap="4">
			<Flex gap="4" align="center" className="w-full">
				<SaveToBookmarks />
				<Box width="100%">
					<Button size="3" variant="classic" className="w-full">
						<Icons.Rocket className="size-4" strokeWidth={2} />
						Buy with one click
					</Button>
				</Box>
			</Flex>

			<Button className="w-full" size="3" variant="surface" onClick={addToCart}>
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
