import { DialogContent, DialogRoot } from "@blazzing-app/ui/dialog-vaul";
import { Icons } from "@blazzing-app/ui/icons";
import type { StoreOrder } from "@blazzing-app/validators";
import {
	Box,
	Button,
	Card,
	Flex,
	Grid,
	IconButton,
	ScrollArea,
	Text,
	Theme,
} from "@radix-ui/themes";
import { Link } from "@remix-run/react";
import { useCopyToClipboard } from "@uidotdev/usehooks";
import React from "react";
import { OrderStatus } from "~/components/badge/order-status";
import { Total } from "~/components/templates/cart/total-info";
import { LineItem } from "~/components/templates/line-item/line-item";
import { useWindowSize } from "~/hooks/use-window-size";
import { formatISODate } from "~/utils/format";
import { useDashboardStore } from "~/zustand/store";

export const OrderPreview = ({ orderID }: { orderID: string }) => {
	const orderMap = useDashboardStore((state) => state.orderMap);
	const order = orderMap.get(orderID);

	return (
		<Card
			className="hidden lg:block overflow-hidden w-[25rem] p-0 sticky top-16"
			x-chunk="dashboard-05-chunk-4"
		>
			<Preview order={order} />
		</Card>
	);
};
const Preview = ({ order }: { order: StoreOrder | undefined }) => {
	const [_, copyToClipboard] = useCopyToClipboard();
	const [hasCopiedText, setHasCopiedText] = React.useState(false);
	return (
		<>
			<Flex p="4" justify="between" className="border-b border-border">
				<Grid gap="2">
					<Flex gap="2" align="center">
						<Box className="w-[200px] text-ellipsis overflow-hidden text-nowrap">
							<Text weight="bold">{order?.id}</Text>
						</Box>
						<IconButton
							variant="surface"
							className="link"
							onClick={() => {
								copyToClipboard(order?.id ?? "");
								setHasCopiedText(true);
								setTimeout(setHasCopiedText, 2000);
							}}
						>
							{hasCopiedText ? (
								<Icons.Check className="size-4" />
							) : (
								<Icons.Copy className="size-4" />
							)}
							<span className="sr-only">Copy Order ID</span>
						</IconButton>
					</Flex>
					<Text size="1">{formatISODate(order?.createdAt)}</Text>
				</Grid>

				<OrderStatus status={order?.status ?? "pending"} />
			</Flex>
			<Grid gap="2" p="4" className="border-b border-border">
				<ScrollArea className="h-[8rem]">
					<ul className="flex flex-col gap-2">
						{order?.items.length === 0 && (
							<Text align="center" color="gray">
								Order is empty
							</Text>
						)}
						{order?.items.map((item) => (
							<LineItem
								lineItem={item}
								key={item.id}
								currencyCode={order?.currencyCode ?? "BYN"}
								readonly={true}
							/>
						))}
					</ul>
				</ScrollArea>

				<Total cartOrOrder={order} lineItems={order?.items ?? []} />
			</Grid>
			<Grid columns="2" gap="4" p="4" className="border-b border-border">
				<Grid gap="3">
					<Text className="font-semibold">Shipping Information</Text>
					<address className="grid gap-0.5 not-italic">
						<Text>{order?.fullName ?? ""}</Text>
						<Text>{order?.shippingAddress?.line1 ?? ""}</Text>
						<Text>{`${order?.shippingAddress?.city ?? ""}, ${order?.shippingAddress?.state ?? ""}, ${order?.shippingAddress?.postalCode ?? ""}`}</Text>
					</address>
				</Grid>
			</Grid>
			<Grid gap="3" p="4" className="border-b border-border">
				<Text className="font-semibold">Customer Information</Text>
				<Grid gap="3">
					<Flex align="center" justify="between">
						<Text>Customer</Text>
						<Text>{order?.fullName ?? ""}</Text>
					</Flex>
					<Flex align="center" justify="between">
						<Text>Email</Text>
						<dd>
							<a href="mailto:">{order?.email ?? ""}</a>
						</dd>
					</Flex>
					<Flex align="center" justify="between">
						<Text>Phone</Text>
						<dd>
							<a href="tel:">{order?.phone ?? ""}</a>
						</dd>
					</Flex>
				</Grid>
			</Grid>
			<Link prefetch="viewport" to={`/dashboard/orders/${order?.id}`}>
				<Box p="4">
					<Button className="w-full" variant="classic">
						Manage
					</Button>
				</Box>
			</Link>
			<Box p="4" className="border-t border-border">
				<Text size="1">
					Updated{" "}
					<time dateTime="2023-11-23">{formatISODate(order?.updatedAt)}</time>
				</Text>
			</Box>
		</>
	);
};
export const OrderPreviewMobile = ({
	opened,
	setOpened,
	orderID,
}: { opened: boolean; setOpened: (val: boolean) => void; orderID: string }) => {
	const orderMap = useDashboardStore((state) => state.orderMap);
	const order = orderMap.get(orderID);
	const windowSize = useWindowSize(100);
	if (windowSize.width > 1024) return null;

	return (
		<DialogRoot
			direction={windowSize.width < 640 ? "bottom" : "right"}
			open={opened}
			onOpenChange={setOpened}
		>
			<DialogContent className="w-[25rem]">
				<Theme>
					<Preview order={order} />
				</Theme>
			</DialogContent>
		</DialogRoot>
	);
};
