import type { schema } from "@blazzing-app/db";
import type { InferInsertModel } from "drizzle-orm";
import { z } from "zod";
import type { Server } from "./entities";

export const EmailSchema = z
	.string({ required_error: "Email is required" })
	.email({ message: "Email is invalid" })
	.min(3, { message: "Email is too short" })
	.max(100, { message: "Email is too long" })
	// users can type the email in any case, but we store it in lowercase
	.transform((value) => value.toLowerCase());

export const VerifyOTPSchema = z.object({
	otp: z.string(),
	target: EmailSchema,
	redirectTo: z.string().optional(),
});
export type VerifyOTP = z.infer<typeof VerifyOTPSchema>;

export const PrepareVerificationSchema = z.object({
	email: EmailSchema,
	redirectTo: z.string().optional(),
});

export type PrepareVerification = z.infer<typeof PrepareVerificationSchema>;
export type InsertAuth = InferInsertModel<typeof schema.authUsers>;

type AuthSession = Server.Session & { fresh: boolean };

type Auth = {
	user: Server.AuthUser | null;
	session: AuthSession | null;
};
const GoogleProfileSchema = z.object({
	sub: z.string(), // User's unique ID
	name: z.string().optional(), // Full name
	given_name: z.string().optional(), // First name
	family_name: z.string().optional(), // Last name
	email: z.string().email(), // Email address
	email_verified: z.boolean().optional(), // Whether the email is verified
	picture: z.string().url().optional(), // Profile picture URL
});
type GoogleProfile = z.infer<typeof GoogleProfileSchema>;

export type { AuthSession, Auth, GoogleProfile };
export { GoogleProfileSchema };
