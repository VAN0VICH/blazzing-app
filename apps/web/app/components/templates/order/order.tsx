import { Icons } from "@blazzing-app/ui/icons";
import type { Order } from "@blazzing-app/validators/client";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Avatar, Box, Card, Flex, Grid } from "@radix-ui/themes";
import React from "react";
import ImagePlaceholder from "~/components/image-placeholder";
import { LineItem } from "../line-item/line-item";

export const OrderComponent = ({ order }: { order: Order }) => {
	const items = order.items;
	const [parent] = useAutoAnimate(/* optional config */);
	const [open, setOpen] = React.useState(false);
	return (
		<Card
			onClick={() => {
				if (items.length === 1) return;
				setOpen((prev) => !prev);
			}}
			ref={parent}
			className="w-full p-0 md:min-w-[500px]"
		>
			<Flex className="w-full">
				<Flex
					direction="column"
					gap="2"
					p="4"
					className="border-r border-border"
				>
					<Avatar
						src={order.store?.image?.url}
						width={50}
						height={50}
						fallback={<ImagePlaceholder />}
					/>
					<h2 className="font-bold">{order.store?.name}</h2>
				</Flex>
				<Grid gap="2" width="100%" p="4">
					<h1 className="font-bold text-lg">Order #1</h1>
					<LineItem
						currencyCode={order.currencyCode}
						lineItem={items[0]!}
						readonly={true}
					/>
				</Grid>
			</Flex>
			{open && (
				<Flex gap="4" pt="2" width="100%">
					<div className="min-w-[75px]" />
					<Grid gap="2" width="100%">
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

			{items.length > 1 && (
				<Flex justify="end" align="center" pt="2">
					<Box>
						{open ? (
							<Icons.Up className="text-gray-11 size-4" />
						) : (
							<Icons.Down className="text-gray-11 size-4" />
						)}
					</Box>
				</Flex>
			)}
		</Card>
	);
};
