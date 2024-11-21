import { z } from "zod";

const WebEnvSchema = z.object({
	WORKER_URL: z.string(),
	REPLICACHE_KEY: z.string(),
	ENVIRONMENT: z.enum(["production", "test", "staging", "development"]),
	PARTYKIT_HOST: z.string().optional(),
	HONEYPOT_SECRET: z.string().optional(),
	SESSION_SECRET: z.string().optional(),
	STRIPE_PUBLISHABLE_KEY: z.string().optional(),
});

type WebEnv = z.infer<typeof WebEnvSchema>;
type WebBindings = { SESSION_KV: KVNamespace; KV: KVNamespace };
export { WebEnvSchema };
export type { WebEnv, WebBindings };
