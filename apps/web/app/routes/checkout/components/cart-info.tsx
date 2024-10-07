import type {
	Cart,
	LineItem as LineItemType,
} from "@blazzing-app/validators/client";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Box, Grid, Heading, ScrollArea, Separator } from "@radix-ui/themes";
import { useCallback } from "react";
import { Total } from "~/components/templates/cart/total-info";
import { LineItem } from "~/components/templates/line-item/line-item";
import { useReplicache } from "~/zustand/replicache";

export const CartInfo = ({
	cart,
	items,
}: { cart: Cart | null | undefined; items: LineItemType[] }) => {
	const rep = useReplicache((state) => state.globalRep);
	const [parent] = useAutoAnimate(/* optional config */);
	const deleteItem = useCallback(
		async (id: string) => {
			await rep?.mutate.deleteLineItem({ id });
		},
		[rep],
	);
	const updateItem = useCallback(
		async (id: string, quantity: number) => {
			await rep?.mutate.updateLineItem({ id, quantity });
		},
		[rep],
	);

	return (
		<Box>
			<Heading size="4" className="py-2">
				In your Cart
			</Heading>
			<Separator className="my-2 w-full" />
			<ScrollArea className="min-h-[200px] max-h-[500px]">
				<Grid gap="2" py="2" ref={parent}>
					{items.map((item) => (
						<LineItem
							lineItem={item}
							key={item.id}
							deleteItem={deleteItem}
							updateItem={updateItem}
							currencyCode={cart?.currencyCode ?? "AUD"}
						/>
					))}
				</Grid>
			</ScrollArea>
			<Total className="mt-auto" cartOrOrder={cart} lineItems={items || []} />
		</Box>
	);
};
