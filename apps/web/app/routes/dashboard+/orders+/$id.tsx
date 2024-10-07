import { Icons } from "@blazzing-app/ui/icons";
import type { Order } from "@blazzing-app/validators/client";
import {
	Avatar,
	Box,
	Card,
	Flex,
	Grid,
	Heading,
	IconButton,
	Link,
	Text,
} from "@radix-ui/themes";
import { useParams } from "@remix-run/react";
import React from "react";
import { OrderStatus } from "~/components/badge/order-status";
import { PaymentStatus } from "~/components/badge/payment-status";
import { ShippingStatus } from "~/components/badge/shipping-status";
import ImagePlaceholder from "~/components/image-placeholder";
import { Total } from "~/components/templates/cart/total-info";
import {
	LineItem,
	LineItemSkeleton,
} from "~/components/templates/line-item/line-item";
import { useDashboardStore } from "~/zustand/store";

const OrderRoute = () => {
	const params = useParams();
	const orderMap = useDashboardStore((state) => state.orderMap);
	const order = orderMap.get(params.id!);
	return (
		<Box className="w-full relative flex p-3 justify-center pb-20 lg:pb-3">
			<Box className="w-full flex flex-col lg:flex-row gap-3">
				<Box className="w-full lg:w-8/12 flex flex-col gap-3 order-1 lg:order-0">
					<OrderInfo order={order} />
					<PaymentInfo paymentStatus={"paid"} />
					<ShippingInfo shippingStatus={"pending"} order={order} />
				</Box>
				<Box className="w-full lg:w-4/12 flex order-0 flex-col gap-3 lg:order-1">
					<CustomerInfo order={order} />
					<CustomerNote />
				</Box>
			</Box>
		</Box>
	);
};
export default OrderRoute;
const CustomerInfo = ({ order }: { order: Order | undefined | null }) => {
	return (
		<Card className="p-0">
			<Flex
				p="4"
				justify="between"
				align="center"
				className="border-b border-border"
			>
				<Heading size="3" className="text-accent-11">
					Customer Information
				</Heading>
			</Flex>
			<Box p="4">
				<Flex justify="center" align="center" direction="column">
					<Avatar
						fallback={<ImagePlaceholder />}
						className="border border-accent-5 size-[200px]"
						src={
							typeof order?.customer?.user?.avatar === "string"
								? order?.customer?.user.avatar
								: order?.customer?.user?.avatar?.url
						}
					/>
					<Heading
						size="4"
						align="center"
						className="text-accent-11 py-2 font-freeman"
					>
						{order?.customer?.user?.username ?? order?.fullName}
					</Heading>
				</Flex>
				<Grid width="100%" pt="4">
					<address className="grid gap-0.5 not-italic ">
						<Flex justify="between">
							<Text className="font-semibold" size="2">
								email:
							</Text>
							<Link
								href="mailto:"
								className="text-sm text-ellipsis overflow-hidden"
							>
								<Text size="2">{order?.email}</Text>
							</Link>
						</Flex>
						<Flex justify="between">
							<Text className="font-semibold" size="2">
								phone:
							</Text>
							<Link href="tel:" className="text-sm">
								<Text size="2">{order?.phone}</Text>
							</Link>
						</Flex>
					</address>
				</Grid>
			</Box>
		</Card>
	);
};
const CustomerNote = () => {
	return (
		<Card className="p-0">
			<Flex
				p="4"
				justify="between"
				align="center"
				className="border-b border-border"
			>
				<Heading size="3" className="text-accent-11">
					Customer Note
				</Heading>
			</Flex>
			<Box p="4">
				<Text color="gray" size="2">
					Customer did not leave a note.
				</Text>
			</Box>
		</Card>
	);
};
const OrderInfo = ({ order }: { order: Order | undefined }) => {
	const [editMode, setEditMode] = React.useState(false);
	const isInitialized = useDashboardStore((state) => state.isInitialized);
	const items = order?.items ?? [];

	return (
		<Card className="p-0">
			<Flex justify="between" align="center" className="border-b border-border">
				<Flex justify="between" p="4" wrap="wrap" gap="2" width="100%">
					<Grid gap="1">
						<Flex gap="2" align="center">
							<Box className="w-[300px] text-ellipsis overflow-hidden text-nowrap">
								<Text
									size="3"
									className="text-accent-11 font-bold "
								>{`${order?.id}`}</Text>
							</Box>
							<IconButton variant="outline">
								<Icons.Copy className="h-3 w-3" />
								<span className="sr-only">Copy Order ID</span>
							</IconButton>
						</Flex>
						<Text size="2">{order?.createdAt}</Text>
					</Grid>

					<Flex gap="4" align="center">
						<OrderStatus status={order?.status ?? "pending"} />
						{editMode ? (
							<Flex gap="4">
								<IconButton
									size="3"
									variant="ghost"
									onClick={() => setEditMode(false)}
								>
									<Icons.Check className="size-4" />
								</IconButton>
								<IconButton
									size="3"
									variant="ghost"
									onClick={() => setEditMode(false)}
								>
									<Icons.Close className="size-4" />
								</IconButton>
							</Flex>
						) : (
							<IconButton
								size="3"
								variant="ghost"
								onClick={() => setEditMode(true)}
							>
								<Icons.Edit className="size-4" />
							</IconButton>
						)}
					</Flex>
				</Flex>
			</Flex>
			<Grid gap="2" p="4">
				{!isInitialized &&
					Array.from({ length: 3 }).map((_, i) => <LineItemSkeleton key={i} />)}
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
			</Grid>
			<Grid p="4">
				<Total cartOrOrder={order} lineItems={items} />
			</Grid>
		</Card>
	);
};
const PaymentInfo = ({
	paymentStatus,
}: { paymentStatus: Order["paymentStatus"] }) => {
	const [editMode, setEditMode] = React.useState(false);
	return (
		<Card className="p-0">
			<Flex
				justify="between"
				p="4"
				wrap="wrap"
				gap="2"
				width="100%"
				className="border-b border-border"
			>
				<Heading size="3" className="text-accent-11">
					Payment Information
				</Heading>
				<Flex gap="4" align="center">
					<PaymentStatus status={paymentStatus ?? "paid"} />
					{editMode ? (
						<Flex gap="4">
							<IconButton
								size="3"
								variant="ghost"
								onClick={() => setEditMode(false)}
							>
								<Icons.Check className="size-4" />
							</IconButton>
							<IconButton
								size="3"
								variant="ghost"
								onClick={() => setEditMode(false)}
							>
								<Icons.Close className="size-4" />
							</IconButton>
						</Flex>
					) : (
						<IconButton
							size="3"
							variant="ghost"
							onClick={() => setEditMode(true)}
						>
							<Icons.Edit className="size-4" />
						</IconButton>
					)}
				</Flex>
			</Flex>
			<Grid gap="3" p="4">
				<Flex align="center" justify="between">
					<Flex align="center" gap="1">
						<Icons.CreditCard className="size-4" />
						Visa
					</Flex>
					<dd>**** **** **** 4532</dd>
				</Flex>
			</Grid>
		</Card>
	);
};
const ShippingInfo = ({
	shippingStatus,
	order,
}: { shippingStatus: Order["shippingStatus"]; order: Order | undefined }) => {
	const [editMode, setEditMode] = React.useState(false);
	return (
		<Card className="p-0">
			<Flex justify="between" p="4" wrap="wrap" gap="2" width="100%">
				<Heading size="3" className="text-accent-11">
					Shipping
				</Heading>
				<Flex gap="4" align="center">
					<ShippingStatus status={shippingStatus ?? "pending"} />
					{editMode ? (
						<Flex gap="4">
							<IconButton
								size="3"
								variant="ghost"
								onClick={() => setEditMode(false)}
							>
								<Icons.Check className="size-4" />
							</IconButton>
							<IconButton
								size="3"
								variant="ghost"
								onClick={() => setEditMode(false)}
							>
								<Icons.Close className="size-4" />
							</IconButton>
						</Flex>
					) : (
						<IconButton
							size="3"
							variant="ghost"
							onClick={() => setEditMode(true)}
						>
							<Icons.Edit className="size-4" />
						</IconButton>
					)}
				</Flex>
			</Flex>
			<Grid gap="3" p="4">
				<address className="grid gap-0.5 not-italic">
					<Text>{order?.fullName}</Text>
					<Text>{order?.shippingAddress?.line1}</Text>
					<Text>{`${order?.shippingAddress?.city}, ${order?.shippingAddress?.state}, ${order?.shippingAddress?.postalCode}`}</Text>
				</address>
			</Grid>
		</Card>
	);
};
