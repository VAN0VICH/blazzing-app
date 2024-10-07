import { Cloudflare, Database } from "@blazzing-app/shared";
import {
	CartError,
	CheckoutFormSchema,
	NeonDatabaseError,
	NotFound,
} from "@blazzing-app/validators";
import { Effect } from "effect";
import Stripe from "stripe";
import { z } from "zod";
import { fn } from "../util/fn";

export namespace PaymentService {
	export const createSession = fn(
		z.object({ cartID: z.string(), checkoutInfo: CheckoutFormSchema }),
		({ checkoutInfo, cartID }) =>
			Effect.gen(function* () {
				const { manager } = yield* Database;
				const { env } = yield* Cloudflare;

				const stripe = new Stripe(env.STRIPE_SECRET_KEY);
				const cart = yield* Effect.tryPromise(() =>
					manager.query.carts.findFirst({
						where: (carts, { eq }) => eq(carts.id, cartID),
						with: {
							items: {
								with: {
									product: {
										with: {
											baseVariant: true,
										},
									},
									variant: {
										with: {
											prices: true,
											optionValues: {
												with: {
													optionValue: {
														with: {
															option: true,
														},
													},
												},
											},
										},
									},
								},
							},
						},
					}),
				).pipe(
					Effect.catchTags({
						UnknownException: (error) =>
							new NeonDatabaseError({ message: error.message }),
					}),
				);
				if (!cart) {
					return yield* Effect.fail(
						new CartError({ message: "Cart not found" }),
					);
				}

				/* items can be from many stores. Map them */
				const storeIDToLineItem = new Map<string, typeof cart.items>();
				yield* Effect.forEach(cart.items ?? [], (lineItem) =>
					Effect.sync(() => {
						const storeID = lineItem.storeID;
						const lineItems = storeIDToLineItem.get(storeID) ?? [];
						lineItems.push(lineItem);
						storeIDToLineItem.set(storeID, lineItems);
					}),
				);

				yield* Effect.forEach(
					[...storeIDToLineItem.entries()],
					([storeID, items]) =>
						Effect.gen(function* () {
							const store = yield* Effect.tryPromise(() =>
								manager.query.stores.findFirst({
									where: (stores, { eq }) => eq(stores.id, storeID),
									with: {
										paymentProfiles: true,
									},
								}),
							).pipe(
								Effect.catchTags({
									UnknownException: (error) =>
										new NeonDatabaseError({ message: error.message }),
								}),
							);
							if (!store) {
								return yield* Effect.fail(
									new NotFound({ message: "Store not found" }),
								);
							}
							const stripeProfile = store.paymentProfiles.find(
								(profile) => !!profile.stripeAccountID,
							);
							if (!stripeProfile?.stripeAccountID)
								return yield* Effect.fail(
									new NotFound({ message: "Stripe profile not found" }),
								);
							const session = yield* Effect.tryPromise(() =>
								stripe.checkout.sessions.create(
									{
										line_items: cart.items.map((item) => ({
											price_data: {
												currency: cart.currencyCode,
												product_data: {
													name:
														item.variant.title ??
														item.product.baseVariant.title ??
														"",
													description:
														item.product.baseVariant.description ?? "",
													images: [
														...(item.variant.images ?? []).map(
															(image) => image.url,
														),
													].filter((i) => i !== undefined),
												},
												unit_amount: item.variant.prices.find(
													(price) => price.currencyCode === cart.currencyCode,
												)?.amount!,
											},
										})),
										payment_intent_data: {
											application_fee_amount: 123,
										},
										metadata: {
											cartID,
											checkoutInfo: JSON.stringify(checkoutInfo),
										},
										mode: "payment",
										success_url:
											env.ENVIRONMENT === "production"
												? "https://blazzing.app/success?session_id={CHECKOUT_SESSION_ID}"
												: "http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}",
									},
									{
										stripeAccount: stripeProfile.stripeAccountID!,
									},
								),
							).pipe(Effect.orDie);
						}),
				);
			}),
	);
}
