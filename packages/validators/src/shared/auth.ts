import { z } from "zod";
import type { AuthUser, Session } from "../server/entities";

type AuthSession = Session & { fresh: boolean };

type Auth = {
	user: AuthUser | null;
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

export type { AuthUser, AuthSession, Auth, GoogleProfile };
export { GoogleProfileSchema };
