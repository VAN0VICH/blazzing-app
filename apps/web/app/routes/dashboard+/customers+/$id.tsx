import { Avatar, Card, Flex, Grid, Heading, Text } from "@radix-ui/themes";
import { OrdersTable } from "../orders+/orders-table/table";
import { useParams } from "@remix-run/react";
import { useDashboardStore } from "~/zustand/store";
import ImagePlaceholder from "~/components/image-placeholder";
import type { StoreCustomer } from "@blazzing-app/validators";

export default function CustomerRoute() {
	const params = useParams();
	const orders = useDashboardStore((state) => state.orders).filter(
		(order) => order.customerID === params.id!,
	);
	const customerMap = useDashboardStore((state) => state.customerMap);
	const customer = customerMap.get(params.id!);
	console.log("customer", customer);
	return (
		<Flex position="relative" p="3" justify="center" className="pb-20 lg:pb-3">
			<div className="w-full max-w-[1700px] flex flex-col lg:flex-row gap-3">
				<section className="w-full lg:w-8/12 flex flex-col gap-3 order-1 lg:order-0">
					<div className="w-full bg-component border border-border rounded-[7px] ">
						<Heading
							size="5"
							className="p-4 justify-center text-accent-11 border-b border-border md:justify-start"
						>
							{`Orders made by 
									${customer?.user?.username ?? customer?.user?.fullName ?? "Unknown"}`}
						</Heading>

						<OrdersTable orders={orders} toolbar={true} withNavigation={true} />
					</div>
				</section>
				<section className="w-full lg:w-4/12 flex order-0 flex-col gap-3 lg:order-1">
					<CustomerInfo customer={customer} />
				</section>
			</div>
		</Flex>
	);
}
const CustomerInfo = ({
	customer,
}: { customer: StoreCustomer | undefined | null }) => {
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
				<Heading size="3" className="text-accent-11 font-semibold">
					Customer Information
				</Heading>
			</Flex>
			<Grid>
				<Flex
					justify="center"
					align="center"
					direction="column"
					className="border-b border-border"
					p="4"
				>
					<Avatar
						fallback={<ImagePlaceholder />}
						className="border border-accent-5 size-[200px]"
						src={
							typeof customer?.user?.avatar === "string"
								? customer?.user.avatar
								: customer?.user?.avatar?.url
						}
					/>
					<Heading
						size="4"
						align="center"
						className="text-accent-11 py-2 font-freeman"
					>
						{customer?.user?.username ?? customer?.user?.fullName}
					</Heading>
				</Flex>
				<Grid p="4">
					<address className="grid gap-0.5 not-italic ">
						<Flex justify="between" align="center" gap="2">
							<Text className="font-semibold" size="2">
								email:
							</Text>
							<a href="mailto:">
								<Text size="2">{customer?.email}</Text>
							</a>
						</Flex>
						<Flex justify="between" align="center" gap="2">
							<Text className="font-semibold" size="2">
								phone:
							</Text>
							<a href="tel:">
								<Text size="2">{customer?.user?.phone} </Text>
							</a>
						</Flex>
					</address>
				</Grid>
			</Grid>
		</Card>
	);
};
