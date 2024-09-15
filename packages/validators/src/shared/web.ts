import { z } from "zod";

const EnvSchema = z.object({
	SERVER_URL: z.string(),
	REPLICACHE_KEY: z.string(),
	ENVIRONMENT: z.enum(["production", "test", "staging", "development"]),
	PARTYKIT_HOST: z.string(),
	LIVEKIT_SERVER_URL: z.string(),
});

type Env = z.infer<typeof EnvSchema>;
type WebBindings = { KV: KVNamespace };
export { EnvSchema };
export type { Env, WebBindings };
