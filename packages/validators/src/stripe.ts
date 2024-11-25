import { schema } from "@blazzing-app/db";
import { createInsertSchema } from "drizzle-zod";
import type { z } from "zod";
import { Schema } from "@effect/schema";

export const InsertStripeSchema = createInsertSchema(schema.stripe);
export type InsertStripeProfile = z.infer<typeof InsertStripeSchema>;
export const StripeUpdatesSchema = InsertStripeSchema.pick({
	isOnboarded: true,
});
export type StripeUpdates = z.infer<typeof StripeUpdatesSchema>;
// const AddressSchema = Schema.Struct({
// 	city: Schema.String,
// 	country: Schema.String,
// 	line1: Schema.String,
// 	line2: Schema.NullOr(Schema.String),
// 	postal_code: Schema.String,
// 	state: Schema.String,
// });
export const StripeAccountSchema = Schema.Struct({
	id: Schema.String,
	charges_enabled: Schema.Boolean,
	payouts_enabled: Schema.Boolean,
	details_submitted: Schema.Boolean,
});
export const StripeAccountBalanceSchema = Schema.Struct({
	available: Schema.Array(
		Schema.Struct({
			amount: Schema.Number,
			currency: Schema.String,
			source_types: Schema.Struct({
				card: Schema.Number,
			}),
		}),
	),
	livemode: Schema.Boolean,
	pending: Schema.Array(
		Schema.Struct({
			amount: Schema.Number,
			currency: Schema.String,
			source_types: Schema.Struct({
				card: Schema.Number,
			}),
		}),
	),
});
/*
{
  "id": "ch_3MmlLrLkdIwHu7ix0snN0B15",
  "object": "charge",
  "amount": 1099,
  "amount_captured": 1099,
  "amount_refunded": 0,
  "application": null,
  "application_fee": null,
  "application_fee_amount": null,
  "balance_transaction": "txn_3MmlLrLkdIwHu7ix0uke3Ezy",
  "billing_details": {
    "address": {
      "city": null,
      "country": null,
      "line1": null,
      "line2": null,
      "postal_code": null,
      "state": null
    },
    "email": null,
    "name": null,
    "phone": null
  },
  "calculated_statement_descriptor": "Stripe",
  "captured": true,
  "created": 1679090539,
  "currency": "usd",
  "customer": null,
  "description": null,
  "disputed": false,
  "failure_balance_transaction": null,
  "failure_code": null,
  "failure_message": null,
  "fraud_details": {},
  "invoice": null,
  "livemode": false,
  "metadata": {},
  "on_behalf_of": null,
  "outcome": {
    "network_status": "approved_by_network",
    "reason": null,
    "risk_level": "normal",
    "risk_score": 32,
    "seller_message": "Payment complete.",
    "type": "authorized"
  },
  "paid": true,
  "payment_intent": null,
  "payment_method": "card_1MmlLrLkdIwHu7ixIJwEWSNR",
  "payment_method_details": {
    "card": {
      "brand": "visa",
      "checks": {
        "address_line1_check": null,
        "address_postal_code_check": null,
        "cvc_check": null
      },
      "country": "US",
      "exp_month": 3,
      "exp_year": 2024,
      "fingerprint": "mToisGZ01V71BCos",
      "funding": "credit",
      "installments": null,
      "last4": "4242",
      "mandate": null,
      "network": "visa",
      "three_d_secure": null,
      "wallet": null
    },
    "type": "card"
  },
  "receipt_email": null,
  "receipt_number": null,
  "receipt_url": "https://pay.stripe.com/receipts/payment/CAcaFwoVYWNjdF8xTTJKVGtMa2RJd0h1N2l4KOvG06AGMgZfBXyr1aw6LBa9vaaSRWU96d8qBwz9z2J_CObiV_H2-e8RezSK_sw0KISesp4czsOUlVKY",
  "refunded": false,
  "review": null,
  "shipping": null,
  "source_transfer": null,
  "statement_descriptor": null,
  "statement_descriptor_suffix": null,
  "status": "succeeded",
  "transfer_data": null,
  "transfer_group": null
}*/

//use the above object to create a schema

export const StripeChargeSchema = Schema.Struct({
	amount: Schema.Number,
	amount_captured: Schema.Number,
	amount_refunded: Schema.Number,
	application: Schema.NullOr(Schema.String),
	application_fee: Schema.NullOr(Schema.String),
	application_fee_amount: Schema.NullOr(Schema.String),
	balance_transaction: Schema.String,
	billing_details: Schema.Struct({
		address: Schema.Struct({
			city: Schema.NullOr(Schema.String),
			country: Schema.NullOr(Schema.String),
			line1: Schema.NullOr(Schema.String),
			line2: Schema.NullOr(Schema.String),
			postal_code: Schema.NullOr(Schema.String),
			state: Schema.NullOr(Schema.String),
		}),
		email: Schema.NullOr(Schema.String),
		name: Schema.NullOr(Schema.String),
		phone: Schema.NullOr(Schema.String),
	}),
	calculated_statement_descriptor: Schema.String,
	captured: Schema.Boolean,
	created: Schema.Number,
	currency: Schema.String,
	customer: Schema.NullOr(Schema.String),
	description: Schema.NullOr(Schema.String),
	disputed: Schema.Boolean,
	failure_balance_transaction: Schema.NullOr(Schema.String),
	failure_code: Schema.NullOr(Schema.String),
	failure_message: Schema.NullOr(Schema.String),
	fraud_details: Schema.Object,
	invoice: Schema.NullOr(Schema.String),
	livemode: Schema.Boolean,
	metadata: Schema.Object,
	on_behalf_of: Schema.NullOr(Schema.String),
	outcome: Schema.Struct({
		network_status: Schema.String,
		reason: Schema.NullOr(Schema.String),
		risk_level: Schema.String,
		risk_score: Schema.Number,
		seller_message: Schema.String,
		type: Schema.String,
	}),
	paid: Schema.Boolean,
	payment_intent: Schema.NullOr(Schema.String),
	payment_method: Schema.String,
	payment_method_details: Schema.Struct({
		card: Schema.Struct({
			brand: Schema.String,
			checks: Schema.Struct({
				address_line1_check: Schema.NullOr(Schema.String),
				address_postal_code_check: Schema.NullOr(Schema.String),
				cvc_check: Schema.NullOr(Schema.String),
			}),
			country: Schema.String,
			exp_month: Schema.Number,
			exp_year: Schema.Number,
			fingerprint: Schema.String,
			funding: Schema.String,
			installments: Schema.NullOr(Schema.Number),
			last4: Schema.String,
			mandate: Schema.NullOr(Schema.String),
			network: Schema.String,
			three_d_secure: Schema.NullOr(Schema.String),
			wallet: Schema.NullOr(Schema.String),
		}),
		type: Schema.String,
	}),
	receipt_email: Schema.NullOr(Schema.String),
	receipt_number: Schema.NullOr(Schema.String),
	receipt_url: Schema.String,
	refunded: Schema.Boolean,
	review: Schema.NullOr(Schema.String),
	shipping: Schema.NullOr(Schema.String),
	source_transfer: Schema.NullOr(Schema.String),
	statement_descriptor: Schema.NullOr(Schema.String),
	statement_descriptor_suffix: Schema.NullOr(Schema.String),
	status: Schema.String,
	transfer_data: Schema.NullOr(Schema.String),
	transfer_group: Schema.NullOr(Schema.String),
});
