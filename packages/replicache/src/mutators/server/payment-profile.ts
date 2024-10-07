import { schema } from "@blazzing-app/db";
import { AuthContext, Cloudflare, Database } from "@blazzing-app/shared";
import {
	InsertPaymentProfileSchema,
	NeonDatabaseError,
} from "@blazzing-app/validators";
import { sql } from "drizzle-orm";
import { Effect } from "effect";
import Stripe from "stripe";
import { z } from "zod";
import { fn } from "../../util/fn";

const createPaymentProfile = fn(
	z.object({
		paymentProfile: InsertPaymentProfileSchema,
		provider: z.literal("stripe"),
	}),
	(input) =>
		Effect.gen(function* () {
			const { manager } = yield* Database;
			const { env } = yield* Cloudflare;
			const { authUser } = yield* AuthContext;
			if (!authUser) return;
			const { paymentProfile } = input;
			const stripe = new Stripe(env.STRIPE_SECRET_KEY);
			const account = yield* Effect.tryPromise(() =>
				stripe.accounts.create({}),
			).pipe(Effect.orDie);

			yield* Effect.tryPromise(() =>
				manager
					.insert(schema.paymentProfiles)
					//@ts-ignore
					.values({
						...paymentProfile,
						authID: authUser.id,
						stripeAccountID: account.id,
					})
					.onConflictDoUpdate({
						set: {
							stripeAccountID: account.id,
							version: sql`${schema.paymentProfiles.version} + 1`,
						},
						target: schema.paymentProfiles.authID,
					}),
			);

			yield* Effect.tryPromise(() =>
				manager.insert(schema.stripe).values({
					id: account.id,
					createdAt: new Date().toISOString(),
					updatedAt: null,
					isLoading: false,
					paymentProfileID: paymentProfile.id,
					version: 0,
				}),
			);
		}).pipe(
			Effect.catchTags({
				UnknownException: (error) =>
					new NeonDatabaseError({ message: error.message }),
			}),
		),
);

export { createPaymentProfile };
