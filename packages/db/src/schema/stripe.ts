import { relations } from "drizzle-orm";
import {
	boolean,
	integer,
	pgTable,
	uniqueIndex,
	varchar,
} from "drizzle-orm/pg-core";

import { paymentProfiles } from "./payment-profile";

export const stripe = pgTable(
	"stripe",
	{
		id: varchar("id").notNull().primaryKey(),
		paymentProfileID: varchar("payment_profile_id")
			.references(() => paymentProfiles.id)
			.notNull(),
		createdAt: varchar("created_at").notNull(),
		updatedAt: varchar("updated_at").$onUpdate(() => new Date().toISOString()),
		version: integer("version").notNull(),
		isLoading: boolean("is_loading"),
		isOnboarded: boolean("is_onboarded"),
	},
	(stripe) => ({
		paymentProfileIndex: uniqueIndex("payment_prof_index").on(
			stripe.paymentProfileID,
		),
	}),
);
export const stripeRelations = relations(stripe, ({ one }) => ({
	paymentProfile: one(paymentProfiles, {
		fields: [stripe.paymentProfileID],
		references: [paymentProfiles.id],
	}),
}));
