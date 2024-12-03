import { z } from "zod";

const WebEnvSchema = z.object({
	WORKER_URL: z.string(),
	REPLICACHE_KEY: z.string(),
	ENVIRONMENT: z.enum(["production", "test", "staging", "development"]),
	PARTYKIT_HOST: z.string().optional(),
	LIVEKIT_SERVER_URL: z.string().optional(),
	STRIPE_PUBLISHABLE_KEY: z.string().optional(),
	BLAZZING_PUBLISHABLE_KEY: z.string(),
	CLERK_PUBLISHABLE_KEY: z.string(),
	CLERK_SECRET_KEY: z.string(),
	CLERK_SIGN_IN_URL: z.string(),
	CLERK_SIGN_UP_URL: z.string(),
	CLERK_SIGN_IN_FORCE_REDIRECT_UR: z.string(),
	CLERK_SIGN_UP_FORCE_REDIRECT_URL: z.string(),
});

type WebEnv = z.infer<typeof WebEnvSchema>;
type WebBindings = { KV: KVNamespace };
export { WebEnvSchema };
export type { WebEnv, WebBindings };
