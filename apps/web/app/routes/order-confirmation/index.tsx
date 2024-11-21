import { json, redirect, type LoaderFunction } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { hc } from "hono/client";
import type { Routes } from "@blazzing-app/functions";
import type { Order } from "@blazzing-app/validators/client";
import { SidebarLayoutWrapper } from "~/components/layout/sidebar-wrapper";
import { Flex, Grid, Heading, Text } from "@radix-ui/themes";
import { OrderComponent } from "~/components/templates/order/order";

type LoaderData = {
	orders: Order[];
};
export const loader: LoaderFunction = async (args) => {
	const { context } = args;
	const url = new URL(args.request.url);
	const id = url.searchParams.getAll("id");

	const honoClient = hc<Routes>(context.cloudflare.env.WORKER_URL);

	const response = await honoClient.order.id.$get(
		{
			query: {
				id,
			},
		},
		{
			headers: {
				"x-publishable-key": context.cloudflare.env.BLAZZING_PUBLISHABLE_KEY,
			},
		},
	);
	if (response.ok) {
		const { result: orders } = await response.json();
		if (orders.length === 0) {
			throw new Response(null, {
				status: 404,
				statusText: "Not Found",
			});
		}
		return json({
			orders,
		});
	}
	const errorURL = new URL("/error");
	errorURL.searchParams.set("error", "order-not-found");
	return redirect(errorURL.toString());
};
export default function OrderConfirmation() {
	const { orders } = useLoaderData<LoaderData>();
	console.log("orders", orders);
	return (
		<SidebarLayoutWrapper>
			<div className="fixed -z-10 left-0 right-0 h-[550px] opacity-60 bg-gradient-to-b from-accent-4 to-transparent " />
			<Flex justify="center" p="4" className="min-h-screen">
				<Flex direction="column" maxWidth="650px" gap="4" pt="100px">
					<Grid gap="2">
						<Heading align="center">Order Confirmation</Heading>
						<Text align="center">Thank you for your order! </Text>
					</Grid>
					{orders.map((order) => (
						<OrderComponent key={order.id} order={order} />
					))}
				</Flex>
			</Flex>
		</SidebarLayoutWrapper>
	);
}
