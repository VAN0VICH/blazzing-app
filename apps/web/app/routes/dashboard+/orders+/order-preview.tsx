import { DialogContent, DialogRoot } from "@blazzing-app/ui/dialog-vaul";
import type { LineItem as LineItemType } from "@blazzing-app/validators/client";
import {
	Box,
	Button,
	Card,
	Flex,
	Grid,
	IconButton,
	ScrollArea,
	Separator,
	Text,
} from "@radix-ui/themes";
import { Link } from "@remix-run/react";
import { Copy } from "lucide-react";
import { OrderStatus } from "~/components/badge/order-status";
import { Total } from "~/components/templates/cart/total-info";
import { LineItem } from "~/components/templates/line-item/line-item";
import { useWindowSize } from "~/hooks/use-window-size";
import { order } from "~/temp/mock-entities";

export const OrderPreview = ({ orderID }: { orderID: string }) => {
	const items = order?.items ?? [];

	return (
		<Card
			className="hidden lg:block overflow-hidden w-[25rem] p-0 sticky top-16"
			x-chunk="dashboard-05-chunk-4"
		>
			<Flex p="4" justify="between" className="border-b border-border">
				<Grid gap="2">
					<Flex gap="2" align="center">
						{orderID}
						<IconButton variant="outline">
							<Copy className="h-3 w-3" />
							<span className="sr-only">Copy Order ID</span>
						</IconButton>
					</Flex>
					<Text size="1">Date: {order?.createdAt}</Text>
				</Grid>

				<OrderStatus status={order?.status ?? "pending"} />
			</Flex>
			<Grid gap="2" p="4" className="border-b border-border">
				<Flex justify="between" py="2">
					<Text>Order status</Text>
				</Flex>

				<ScrollArea className="h-[8rem]">
					<ul className="flex flex-col gap-2">
						{items.length === 0 && (
							<Text align="center" color="gray">
								Order is empty
							</Text>
						)}
						{items.map((item) => (
							<LineItem
								lineItem={item}
								key={item.id}
								currencyCode={order?.currencyCode ?? "AUD"}
								readonly={true}
							/>
						))}
					</ul>
				</ScrollArea>

				<Total cartOrOrder={order} lineItems={items} />
			</Grid>
			<Grid columns="2" gap="4" p="4" className="border-b border-border">
				<Grid gap="3">
					<Text className="font-semibold">Shipping Information</Text>
					<address className="grid gap-0.5 not-italic">
						<Text>{order?.fullName}</Text>
						<Text>{order?.shippingAddress?.line1}</Text>
						<Text>{`${order?.shippingAddress?.city}, ${order?.shippingAddress?.state}, ${order?.shippingAddress?.postalCode}`}</Text>
					</address>
				</Grid>
			</Grid>
			<Grid gap="3" p="4" className="border-b border-border">
				<Text>Customer Information</Text>
				<Grid gap="3">
					<Flex align="center" justify="between">
						<Text>Customer</Text>
						<Text>{order?.fullName}</Text>
					</Flex>
					<Flex align="center" justify="between">
						<Text>Email</Text>
						<dd>
							<a href="mailto:">{order?.email}</a>
						</dd>
					</Flex>
					<Flex align="center" justify="between">
						<Text>Phone</Text>
						<dd>
							<a href="tel:">{order?.phone}</a>
						</dd>
					</Flex>
				</Grid>
			</Grid>
			<Link prefetch="viewport" to={`/dashboard/orders/${orderID}`}>
				<Box p="2">
					<Button className="w-full" variant="classic">
						Manage
					</Button>
				</Box>
			</Link>
			<Box p="4" className="border-t border-border">
				<Text size="1">
					Updated <time dateTime="2023-11-23">{order?.updatedAt}</time>
				</Text>
			</Box>
		</Card>
	);
};
export const OrderPreviewMobile = ({
	opened,
	setOpened,
	orderID,
}: { opened: boolean; setOpened: (val: boolean) => void; orderID: string }) => {
	const items = [] as LineItemType[];
	const windowSize = useWindowSize(100);

	if (windowSize.width > 1024) return null;

	return (
		<DialogRoot
			direction={windowSize.width < 640 ? "bottom" : "right"}
			open={opened}
			onOpenChange={setOpened}
		>
			<DialogContent className="w-[25rem]">
				<Grid>
					{orderID}
					<IconButton
						variant="outline"
						className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
					>
						<Copy className="h-3 w-3" />
						<span className="sr-only">Copy Order ID</span>
					</IconButton>
					<Text>Date: {order?.createdAt}</Text>
				</Grid>
				<OrderStatus status={order?.status ?? "pending"} />
				<Grid gap="2">
					<ScrollArea className="h-[17rem] p-2">
						<ul className="flex flex-col gap-2">
							{items.length === 0 && (
								<p className="text-slate-11 text-center">Order is empty</p>
							)}
							{items.map((item) => (
								<LineItem
									lineItem={item}
									key={item.id}
									currencyCode={order?.currencyCode ?? "AUD"}
									readonly={true}
								/>
							))}
						</ul>
					</ScrollArea>

					<Total cartOrOrder={order} lineItems={items} />
				</Grid>
				<div className="grid grid-cols-2 gap-4 mt-2">
					<div className="grid gap-3">
						<div className="font-semibold">Shipping Information</div>
						<address className="grid gap-0.5 not-italic text-slate-11">
							<span>{order?.fullName}</span>
							<span>{order?.shippingAddress?.line1}</span>
							<span>{`${order?.shippingAddress?.city}, ${order?.shippingAddress?.state}, ${order?.shippingAddress?.postalCode}`}</span>
						</address>
					</div>
				</div>
				<Separator className="my-4" />
				<div className="grid gap-3">
					<div className="font-semibold">Customer Information</div>
					<dl className="grid gap-3">
						<div className="flex items-center justify-between">
							<dt className="text-slate-11">Customer</dt>
							<dd>{order?.fullName}</dd>
						</div>
						<div className="flex items-center justify-between">
							<dt className="text-slate-11">{order?.email}</dt>
							<dd>
								<a href="mailto:">{order?.email}</a>
							</dd>
						</div>
						<div className="flex items-center justify-between">
							<dt className="text-slate-11">Phone</dt>
							<dd>
								<a href="tel:">{order?.phone}</a>
							</dd>
						</div>
					</dl>
				</div>
				<Separator className="my-4" />
				<Link prefetch="viewport" to={`/dashboard/orders/${orderID}`}>
					Manage
				</Link>
				<Text>
					Updated <time dateTime="2023-11-23">{order?.updatedAt}</time>
				</Text>
			</DialogContent>
		</DialogRoot>
	);
};
