import { PriceNotFound } from "@blazzing-app/validators";
import type { Cart, LineItem, Order } from "@blazzing-app/validators/client";
import type * as Server from "@blazzing-app/validators/server";
import { Effect, pipe } from "effect";
type CombinedLineItem = (LineItem | Server.LineItem) & {
	variant: Server.Variant & { prices: Server.Price[] };
};
export const getLineItemPriceAmount = (
	lineItem: CombinedLineItem,

	currencyCode: string,
) =>
	pipe(
		Effect.sync(() =>
			lineItem.variant.prices.find((p) => p.currencyCode === currencyCode),
		),
		Effect.flatMap((price) =>
			price
				? Effect.succeed(price.amount)
				: Effect.fail(
						new PriceNotFound({
							message: `Price for "${lineItem.variant.title}" with the currency code "${currencyCode}" not found. Please remove it from the cart.`,
						}),
					),
		),
	);

export const cartSubtotal = (
	lineItems: CombinedLineItem[],
	cartOrOrder: Cart | Order | Server.Cart | Server.Order,
) =>
	pipe(
		Effect.try(() => {
			const reduce = Effect.reduce(0, (acc, item: CombinedLineItem) =>
				pipe(
					getLineItemPriceAmount(item, cartOrOrder.currencyCode),
					Effect.map((price) => acc + item.quantity * price),
				),
			);
			return reduce(lineItems);
		}),
		Effect.flatMap((subtotal) => subtotal),
		Effect.catchTags({
			UnknownException: (error) => Effect.orDie(error),
		}),
	);
