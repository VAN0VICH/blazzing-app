import {
	CheckoutFormSchema,
	type WorkerBindings,
	type WorkerEnv,
} from "@blazzing-app/validators";
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import Stripe from "stripe";
import { getDB } from "../lib/db";
import { generateID } from "@blazzing-app/utils";
export namespace PaymentApi {
	export const route = new OpenAPIHono<{
		Bindings: WorkerBindings & WorkerEnv;
	}>()
		.openapi(
			createRoute({
				security: [{ Bearer: [] }],
				method: "post",
				path: "/create-session",
				request: {
					body: {
						content: {
							"application/json": {
								schema: z.object({
									cartID: z.string(),
									checkoutInfo: CheckoutFormSchema,
								}),
							},
						},
					},
				},
				responses: {
					200: {
						content: {
							"application/json": {
								schema: z.object({
									url: z.boolean().nullable(),
								}),
							},
						},
						description: "Creates payment profile.",
					},
				},
			}),
			//@ts-ignore
			async (c) => {
				const { cartID, checkoutInfo } = c.req.valid("json");
				const db = getDB({ connectionString: c.env.DATABASE_URL });
				const stripe = new Stripe(c.env.STRIPE_SECRET_KEY);
				const cart = await db.query.carts.findFirst({
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
				});
				if (!cart) {
					return c.json({ url: null }, 500);
				}

				const session = await stripe.checkout.sessions.create({
					line_items: cart.items.map((item) => ({
						price_data: {
							currency: cart.currencyCode,
							product_data: {
								name:
									item.variant.title ?? item.product.baseVariant.title ?? "",
								description: item.product.baseVariant.description ?? "",
								images: [
									...(item.variant.images ?? []).map((image) => image.url),
								].filter((i) => i !== undefined),
							},
							unit_amount: item.variant.prices.find(
								(price) => price.currencyCode === cart.currencyCode,
							)?.amount!,
						},
					})),
					payment_intent_data: {
						transfer_group: generateID({ prefix: "transfer_group" }),
					},
					metadata: {
						cartID,
						checkoutInfo: JSON.stringify(checkoutInfo),
					},
					mode: "payment",
					success_url:
						c.env.ENVIRONMENT === "production"
							? "https://blazzing.app/success?session_id={CHECKOUT_SESSION_ID}"
							: "http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}",
				});

				return c.json({ url: session.url });
			},
		)
		.openapi(
			createRoute({
				security: [{ Bearer: [] }],
				method: "post",
				path: "/stripe-webhook",
				responses: {
					200: {
						content: {
							"application/json": {
								schema: z.object({
									result: z.boolean(),
									message: z.string().optional(),
								}),
							},
						},
						description: "Creates payment profile.",
					},
				},
			}),
			//@ts-ignore
			async (c) => {
				const db = getDB({ connectionString: c.env.DATABASE_URL });
				const stripe = new Stripe(c.env.STRIPE_SECRET_KEY);
				const body = await c.req.text();

				// Only verify the event if you have an endpoint secret defined.
				// Otherwise use the basic event deserialized with JSON.parse
				const signature = c.req.raw.headers.get("stripe-signature");
				if (!signature) {
					return c.json({ result: false, message: "Invalid signature" }, 400);
				}
				try {
					const event = stripe.webhooks.constructEvent(
						body,
						signature,
						c.env.STRIPE_WEBHOOK_SECRET,
					);
					// Handle the event
					switch (event.type) {
						case "checkout.session.completed": {
							const session = event.data.object;

							console.log(`Session ${session.id} was successful!`);
							// Then define and call a method to handle the successful session.
							// handleCheckoutSession(session);
							break;
						}
						case "payment_intent.succeeded":
							{
								const paymentIntent = event.data.object;
								console.log(
									`PaymentIntent for ${paymentIntent.amount} was successful!`,
								);
								// Then define and call a method to handle the successful payment intent.
								// handlePaymentIntentSucceeded(paymentIntent);
							}
							break;
						case "payment_method.attached": {
							const paymentMethod = event.data.object;
							// Then define and call a method to handle the successful attachment of a PaymentMethod.
							// handlePaymentMethodAttached(paymentMethod);
							break;
						}
						default:
							// Unexpected event type
							console.log(`Unhandled event type ${event.type}.`);
					}
				} catch (err) {
					console.log("⚠️  Webhook signature verification failed.", err);
					return c.json({ result: false, message: "Invalid signature" }, 400);
				}
			},
		);
}
