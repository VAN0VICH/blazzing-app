import { Avatar, Card, Flex, Grid, Heading, Skeleton } from "@radix-ui/themes";
import { OrderComponent } from "~/components/templates/order/order";
import { useGlobalStore } from "~/zustand/store";
export default function Page() {
	const orders = useGlobalStore((state) => state.orders);
	return (
		<Flex align="center" direction="column" p="2">
			<Heading className="py-4">My orders</Heading>
			<Flex
				maxWidth="1700px"
				width="100%"
				gap="4"
				justify="center"
				className="flex-col sm:flex-row"
			>
				<Grid
					width={{ initial: "100%", sm: "70%" }}
					maxWidth={{ sm: "600px" }}
					className="order-1 sm:order-0"
				>
					<Grid gap="2">
						{orders.map((order) => (
							<OrderComponent key={order.id} order={order} />
						))}
					</Grid>
				</Grid>
				<Grid
					width={{ initial: "100%", sm: "30%" }}
					className="order-0 sm:order-1"
				>
					<Card>
						<Heading size="3">Top shops</Heading>
						<Flex gap="2">
							<Avatar fallback="f" />
							<Grid gap="2" width="100%">
								<Skeleton width="100%" />
								<Skeleton width="100%" />
							</Grid>
						</Flex>
					</Card>
				</Grid>
			</Flex>
		</Flex>
	);
}
