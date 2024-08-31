import { z } from "zod";

const WebEnvSchema = z.object({
	SERVER_URL: z.string(),
	REPLICACHE_KEY: z.string(),
	ENVIRONMENT: z.enum(["production", "test", "staging", "development"]),
	PARTYKIT_HOST: z.string(),
	HONEYPOT_SECRET: z.string(),
	SESSION_SECRET: z.string().optional(),
	STRIPE_PUBLISHABLE_KEY: z.string(),
	LIVEKIT_SERVER_URL: z.string(),
});

type WebEnv = z.infer<typeof WebEnvSchema>;
export { WebEnvSchema };
export type { WebEnv };
