import {
	DialogContent,
	DialogRoot,
	DialogTitle,
	DialogTrigger,
} from "@blazzing-app/ui/dialog-vaul";
import { Icons, strokeWidth } from "@blazzing-app/ui/icons";
import type { LineItem as LineItemType } from "@blazzing-app/validators/client";
import {
	Button,
	Flex,
	Grid,
	IconButton,
	ScrollArea,
	Theme,
} from "@radix-ui/themes";
import { Link } from "@remix-run/react";
import { useUserPreferences } from "~/hooks/use-user-preferences";
import { cart } from "~/temp/mock-entities";
import { useCartState } from "~/zustand/state";
import { LineItem, LineItemSkeleton } from "../line-item/line-item";
import { Total } from "./total-info";

export const CartSheet = ({ cartID }: { cartID: string | null }) => {
	const items = [] as LineItemType[];
	const { opened, setOpened } = useCartState();
	const isInitialized = true;
	const { accentColor } = useUserPreferences();
	return (
		<DialogRoot direction="right" open={opened} onOpenChange={setOpened}>
			<DialogTrigger asChild>
				<IconButton variant={"surface"} size="3">
					<Icons.ShoppingCart
						size={20}
						strokeWidth={strokeWidth}
						className="text-slate-11"
					/>
				</IconButton>
			</DialogTrigger>
			<DialogContent className="sm:w-[350px]">
				<DialogTitle className="p-4 border-b border-border ">Cart</DialogTitle>
				<ScrollArea className="h-[75vh] px-4 pt-2">
					<Grid gap="2">
						{!isInitialized &&
							Array.from({ length: 5 }).map((_, i) => (
								<LineItemSkeleton key={i} />
							))}
						{items.length === 0 && (
							<p className="text-slate-11 mt-40 dark:text-white text-center">
								Cart is empty
							</p>
						)}
						{items.map((item) => (
							<LineItem
								lineItem={item}
								key={item.id}
								deleteItem={() => {
									return new Promise((resolve) => resolve());
								}}
								updateItem={() => {
									return new Promise((resolve) => resolve());
								}}
								currencyCode={cart?.currencyCode ?? "AUD"}
							/>
						))}
					</Grid>
				</ScrollArea>
				<Total
					className="mt-auto p-4 border-t border-border"
					cartOrOrder={cart}
					lineItems={items}
				/>
				<Flex className="w-full px-4 pb-4">
					<Theme accentColor={accentColor ?? "ruby"} className="w-full">
						<Link to="/checkout" prefetch="viewport" className="w-full">
							<Button variant="classic" className="w-full" size="3">
								Checkout
							</Button>
						</Link>
					</Theme>
				</Flex>
			</DialogContent>
		</DialogRoot>
	);
};
