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
import { Total } from "~/components/templates/cart/total-info";
import {
	LineItem,
	LineItemSkeleton,
} from "~/components/templates/line-item/line-item";
import { order } from "~/temp/mock-entities";

const OrderRoute = () => {
	return (
		<main className="w-full relative flex p-3 justify-center">
			<div className="w-full max-w-[1300px] flex flex-col lg:flex-row gap-3">
				<section className="w-full lg:w-8/12 flex flex-col gap-3 order-1 lg:order-0">
					<OrderInfo order={order} />
					<PaymentInfo paymentStatus={"paid"} />
					<ShippingInfo shippingStatus={"pending"} />
				</section>
				<section className="w-full lg:w-4/12 flex order-0 flex-col gap-3 lg:order-1">
					<CustomerInfo order={undefined} />
					<CustomerNote />
				</section>
			</div>
		</main>
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
				<Flex justify="center">
					<Avatar fallback="F" className="w-[200px] h-[200px]" />
					<Text align="center">{order?.user?.username ?? order?.fullName}</Text>
				</Flex>
				<Grid width="100%" className="border-b border-border" py="4">
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
				<Grid columns="2" gap="4" py="4">
					<Grid gap="3">
						<Text className="font-semibold" size="2">
							Shipping Information
						</Text>
						<address className="grid gap-0.5 not-italic">
							<Text size="2">{order?.fullName}</Text>
							<Text size="2">{order?.shippingAddress?.line1}</Text>
							<Text size="2">{`${order?.shippingAddress?.city}, ${order?.shippingAddress?.state}, ${order?.shippingAddress?.postalCode}`}</Text>
						</address>
					</Grid>
					<Grid gap="3">
						<Text className="font-semibold" size="2">
							Billing Information
						</Text>
						<address className="grid gap-0.5 not-italic">
							<Text size="2">{order?.fullName}</Text>
							<Text size="2">{order?.shippingAddress?.line1}</Text>
							<Text size="2">{`${order?.shippingAddress?.city}, ${order?.shippingAddress?.state}, ${order?.shippingAddress?.postalCode}`}</Text>
						</address>
					</Grid>
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
	const items = order?.items ?? [];
	const isInitialized = true;

	return (
		<Card className="p-0">
			<Flex justify="between" align="center" className="border-b border-border">
				<Flex justify="between" p="4" wrap="wrap" gap="2" width="100%">
					<Grid gap="1">
						<Heading
							size="3"
							className="text-accent-11 font-bold text-ellipsis overflow-hidden"
						>{`${order?.id}`}</Heading>
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
}: { shippingStatus: Order["shippingStatus"] }) => {
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
		</Card>
	);
};
