import { z } from "zod";

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
export type AuthUser = {
	id: string;
	email: string;
	avatar: string | null | undefined;
	fullName: string | null | undefined;
};
