import { cartSubtotal } from "@blazzing-app/utils";
import React from "react";
import type { Cart, LineItem, Order } from "@blazzing-app/validators/client";
import { cn } from "@blazzing-app/ui";
import { Effect, pipe } from "effect";
import { toast } from "@blazzing-app/ui/toast";
import Price from "~/components/price";
import { Box, Flex, Separator, Text } from "@radix-ui/themes";
export const Total = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement> & {
		cartOrOrder: Cart | Order | null | undefined;
		lineItems: LineItem[];
	}
>(({ className, cartOrOrder, lineItems, ...props }, ref) => {
	const subtotal = React.useMemo(
		() =>
			cartOrOrder
				? Effect.runSync(
						cartSubtotal(lineItems, cartOrOrder).pipe(
							Effect.catchTags({
								PriceNotFound: (error) =>
									pipe(
										Effect.succeed(-1),
										Effect.zipLeft(
											Effect.sync(() => toast.error(error.message)),
										),
									),
							}),
						),
					)
				: 0,
		[cartOrOrder, lineItems],
	);
	return (
		<Box ref={ref} className={cn("w-full", className)} {...props}>
			<Flex justify="between">
				<Text weight="medium">Subtotal:</Text>

				<Price
					amount={subtotal}
					currencyCode={cartOrOrder?.currencyCode ?? "AUD"}
				/>
			</Flex>

			<Flex justify="between">
				<Text weight="medium">Shipping:</Text>
				<Text>0</Text>
			</Flex>

			<Flex justify="between">
				<Text weight="medium">Taxes:</Text>
				<Text>0</Text>
			</Flex>
			<Separator className="my-4 w-full bg-border" />

			<Flex justify="between">
				<Text weight="bold">Total:</Text>
				<Price
					amount={subtotal}
					currencyCode={cartOrOrder?.currencyCode ?? "AUD"}
				/>
			</Flex>
		</Box>
	);
});
