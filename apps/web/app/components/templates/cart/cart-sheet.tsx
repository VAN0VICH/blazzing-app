import {
	DialogContent,
	DialogRoot,
	DialogTitle,
	DialogTrigger,
} from "@blazzing-app/ui/dialog-vaul";
import { Icons, strokeWidth } from "@blazzing-app/ui/icons";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import {
	Box,
	Button,
	Flex,
	Grid,
	ScrollArea,
	Text,
	Theme,
} from "@radix-ui/themes";
import { Link } from "@remix-run/react";
import React from "react";
import { useUserPreferences } from "~/hooks/use-user-preferences";
import { useReplicache } from "~/zustand/replicache";
import { useCartState } from "~/zustand/state";
import { useGlobalStore } from "~/zustand/store";
import { LineItem, LineItemSkeleton } from "../line-item/line-item";
import { Total } from "./total-info";

export const CartSheet = ({ cartID }: { cartID: string | null }) => {
	const isInitialized = useGlobalStore((state) => state.isInitialized);
	const cartMap = useGlobalStore((state) => state.cartMap);
	const cart = cartMap.get(cartID ?? "");
	const items = useGlobalStore((state) =>
		state.lineItems.filter((item) => item.cartID === cartID),
	);
	const [parent] = useAutoAnimate({ duration: 200 });

	const { opened, setOpened } = useCartState();
	const rep = useReplicache((state) => state.globalRep);

	const deleteItem = React.useCallback(
		async (id: string) => {
			await rep?.mutate.deleteLineItem({ id });
		},
		[rep],
	);
	const updateItem = React.useCallback(
		async (id: string, quantity: number) => {
			await rep?.mutate.updateLineItem({ id, quantity });
		},
		[rep],
	);
	const { accentColor } = useUserPreferences();
	return (
		<DialogRoot direction="right" open={opened} onOpenChange={setOpened}>
			<DialogTrigger asChild>
				<button
					type="button"
					className="bg-component dark:bg-gray-3 dark:shadow-accent-2 size-[45px] flex justify-center items-center shadow-sm text-accent-11 hover:bg-accent-2 hover:border-accent-6 border border-border rounded-[7px] focus-visible:ring-accent-8 focus-visible:outline-none focus-visible:ring-2"
				>
					<Icons.ShoppingCart
						size={20}
						strokeWidth={strokeWidth}
						className="size-5"
					/>
				</button>
			</DialogTrigger>
			<DialogContent className="sm:w-[350px]">
				<Theme
					accentColor={accentColor ?? "ruby"}
					className="w-full relative h-full min-h-[500px]"
				>
					<DialogTitle className="p-4 border-b border-border ">
						Cart
					</DialogTitle>
					<ScrollArea className="h-[68vh] pt-2">
						<Grid gap="2" ref={parent} className="px-2">
							{!isInitialized &&
								Array.from({ length: 5 }).map((_, i) => (
									<LineItemSkeleton key={i} />
								))}
							{items.length === 0 && (
								<Text color="gray" className="mt-40 text-center">
									Cart is empty
								</Text>
							)}
							{items.map((item) => (
								<LineItem
									lineItem={item}
									key={item.id}
									deleteItem={deleteItem}
									updateItem={updateItem}
									currencyCode={cart?.currencyCode ?? "BYN"}
								/>
							))}
						</Grid>
					</ScrollArea>
					<Box position="absolute" bottom="0" right="0" width="100%">
						<Total
							className="mt-auto p-4 border-t border-border"
							cartOrOrder={cart}
							lineItems={items}
						/>
						<Flex className="w-full px-4 pb-4">
							<Link to="/checkout" prefetch="viewport" className="w-full">
								<Button variant="classic" className="w-full" size="3">
									Checkout
								</Button>
							</Link>
						</Flex>
					</Box>
				</Theme>
			</DialogContent>
		</DialogRoot>
	);
};
