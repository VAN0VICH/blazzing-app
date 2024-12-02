import type { Routes } from "@blazzing-app/functions";
import { toast } from "@blazzing-app/ui/toast";
import {
	DeliveryCheckoutFormSchema,
	type DeliveryCheckoutForm,
} from "@blazzing-app/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Flex, Grid, Spinner } from "@radix-ui/themes";
import { useNavigate } from "@remix-run/react";
import { hc } from "hono/client";
import React, { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useCartState } from "~/zustand/state";
import { useGlobalStore } from "~/zustand/store";
import { CartInfo } from "./cart-info";
import { CustomerInfo } from "./customer-info";
import { ShippingAddressInfo } from "./shipping-address-info";

export const DesktopCheckout = ({
	cartID,
	tempUserID,
}: { cartID: string; tempUserID: string | undefined }) => {
	const users = useGlobalStore((state) => state.users);
	const cartMap = useGlobalStore((state) => state.cartMap);
	const cart = cartMap.get(cartID);
	const [isLoading, setIsLoading] = React.useState(false);

	const items = useGlobalStore((state) =>
		state.lineItems
			.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
			.filter((item) => item.cartID === cartID),
	);

	const [honoClient] = React.useState(() => hc<Routes>(window.ENV.WORKER_URL));
	const navigate = useNavigate();

	const [user] = users;

	const { opened, setOpened } = useCartState();
	const methods = useForm<DeliveryCheckoutForm>({
		resolver: zodResolver(DeliveryCheckoutFormSchema),
		defaultValues: {
			email: user?.email ? user.email : (cart?.email ?? ""),
			phone: user?.phone ?? cart?.phone ?? "",
			fullName: user?.fullName ?? cart?.fullName ?? "",
			...(cart?.shippingAddress && {
				shippingAddress:
					cart?.shippingAddress as DeliveryCheckoutForm["shippingAddress"],
			}),
		},
	});

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (opened) {
			setOpened(false);
		}
	}, [opened]);

	//TODO: CREATE ACTUAL WORKFLOW
	const onSubmit = async (data: DeliveryCheckoutForm) => {
		if (items.length === 0) {
			toast.error("Cart is empty");
			return;
		}
		setIsLoading(true);

		// const response = await honoClient.payment["create-session"].$post({
		// 	json: {
		// 		cartID,
		// 		accountID,
		// 	},
		// });

		const response = await honoClient.cart["complete-cart"].$post(
			{
				json: {
					checkoutInfo: data,
					id: cartID,
					type: "delivery",
				},
			},

			{
				headers: {
					"x-publishable-key": window.ENV.BLAZZING_PUBLISHABLE_KEY,
					...(tempUserID && { "x-temp-user-id": tempUserID }),
				},
			},
		);
		console.log("response status", response.status);
		if (response.ok) {
			const { result: orderIDs } = await response.json();
			console.log("order ids", orderIDs);

			if (orderIDs.length > 0) {
				return navigate(
					`/order-confirmation?${orderIDs.map((id) => `id=${id}`).join("&")}`,
				);
			}
		}

		setIsLoading(false);
		return navigate("/error?error=Something wrong happened");
	};

	return (
		<Flex
			width="100%"
			mt="9"
			justify="center"
			p="4"
			className="bg-gray-1 min-h-screen"
		>
			<Box className="w-full mb-20" maxWidth="1700px">
				<FormProvider {...methods}>
					<form
						className="w-full flex gap-10 flex-col md:flex-row"
						onSubmit={methods.handleSubmit(onSubmit)}
					>
						<Flex
							className="flex-col md:flex-row gap-8 lg:gap-[100px]"
							width="100%"
						>
							<Flex direction="column" gap="4" className="w-full " align="end">
								<Grid
									gap="8"
									className="md:max-w-[500px] lg:min-w-[500px] w-full"
								>
									<CustomerInfo user={user} />
									<ShippingAddressInfo />
									{/* <PaymentInfo /> */}
									<Grid className="mt-2 md:hidden">
										<Button
											className="w-full"
											type="submit"
											disabled={isLoading}
										>
											{isLoading && <Spinner />}
											Pay
										</Button>
									</Grid>
								</Grid>
							</Flex>

							<Box className="w-full">
								<Box className="md:max-w-[400px] w-full">
									<CartInfo cart={cart} items={items} />

									<Box className="mt-4 hidden md:flex">
										<Button
											className="w-full"
											type="submit"
											variant="classic"
											disabled={isLoading}
										>
											{isLoading && <Spinner />}
											Pay
										</Button>
									</Box>
								</Box>
							</Box>
						</Flex>
					</form>
				</FormProvider>
			</Box>
		</Flex>
	);
};
