import type { Customer } from "@blazzing-app/validators/client";
import { OrdersTable } from "../orders+/orders-table/table";
import { Avatar, Box, Card, Flex, Grid, Heading, Text } from "@radix-ui/themes";
import { customer } from "~/temp/mock-entities";
import { PageHeader } from "../components/page-header";

export default function CustomerRoute() {
	return (
		<Flex position="relative" p="3" justify="center">
			<div className="w-full max-w-[1300px] flex flex-col lg:flex-row gap-3">
				<section className="w-full lg:w-8/12 flex flex-col gap-3 order-1 lg:order-0">
					<div className="w-full bg-component border border-border rounded-[7px] ">
						<PageHeader
							title={`Orders made by 
							${customer?.user?.username ?? customer?.user?.fullName}`}
							className="text-accent-11 p-4 border-b border-border"
						/>

						<OrdersTable orders={[]} toolbar={true} withNavigation={true} />
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
}: { customer: Customer | undefined | null }) => {
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
					<Avatar fallback="F" className="size-10" />
					<Flex justify="center" pt="4" className="font-semibold">
						<Text className="text-accent-11">
							{customer?.user?.username ?? customer?.user?.fullName}
						</Text>
					</Flex>
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
