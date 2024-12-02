import { relations } from "drizzle-orm";
import { integer, pgTable, uniqueIndex, varchar } from "drizzle-orm/pg-core";

import { stripe } from "./stripe";

export const paymentProfiles = pgTable(
	"payment_profiles",
	{
		id: varchar("id").notNull().primaryKey(),
		authID: varchar("auth_id").notNull(),
		stripeAccountID: varchar("stripe_account_id"),
		createdAt: varchar("created_at").notNull(),
		updatedAt: varchar("updated_at").$onUpdate(() => new Date().toISOString()),
		version: integer("version").notNull(),
	},
	(profile) => ({
		authIDIndex: uniqueIndex("auth_id_index1").on(profile.authID),
		stripeAccountIDIndex: uniqueIndex("stripe_account_id_index").on(
			profile.stripeAccountID,
		),
	}),
);
export const paymentProfileRelations = relations(
	paymentProfiles,
	({ one }) => ({
		stripe: one(stripe, {
			fields: [paymentProfiles.stripeAccountID],
			references: [stripe.id],
		}),
	}),
);
