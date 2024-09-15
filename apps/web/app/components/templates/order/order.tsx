import { useAutoAnimate } from "@formkit/auto-animate/react";
import React from "react";
import { LineItem } from "../line-item/line-item";
import { Avatar, Card, Flex, Grid } from "@radix-ui/themes";
import type { Order } from "@blazzing-app/validators/client";

export const OrderComponent = ({ order }: { order: Order }) => {
	const items = order.items;
	const [parent] = useAutoAnimate(/* optional config */);
	const [open, setOpen] = React.useState(false);
	return (
		<Card
			className="w-full cursor-pointer     border border-border   bg-component p-4"
			onClick={() => {
				if (items.length === 1) return;
				setOpen((prev) => !prev);
			}}
		>
			<Flex gap="4" className="flex gap-4 w-full">
				<Flex direction="column" gap="2">
					<Avatar
						src="https://github.com/shadcn.png"
						width={50}
						height={50}
						fallback="F"
					/>
					<h2 className="font-bold">{order.store?.name}</h2>
				</Flex>
				<Grid gap="2">
					<h1 className="font-bold text-lg">Order #1</h1>
					<LineItem
						currencyCode={order.currencyCode}
						lineItem={items[0]!}
						readonly={true}
					/>
				</Grid>
			</Flex>
			{open && (
				<Flex gap="4" pt="2">
					<div className="min-w-10" />
					<Grid gap="2">
						{items.length > 1 &&
							items
								.slice(1)
								.map((item) => (
									<LineItem
										key={item.id}
										currencyCode={order.currencyCode}
										lineItem={item}
										readonly={true}
									/>
								))}
					</Grid>
				</Flex>
			)}

			<div className="w-4" />
		</Card>
	);
};
