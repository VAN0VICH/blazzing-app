import type { PlatformProxy } from "wrangler";
import { z } from "zod";
const WebEnvSchema = z.object({
	WORKER_URL: z.string(),
	REPLICACHE_KEY: z.string(),
	ENVIRONMENT: z.enum(["production", "test", "staging", "development"]),
	PARTYKIT_HOST: z.string().optional(),
	BLAZZING_PUBLISHABLE_KEY: z.string(),
	CLERK_PUBLISHABLE_KEY: z.string(),
	CLERK_SECRET_KEY: z.string(),
	CLERK_SIGN_IN_URL: z.string(),
	CLERK_SIGN_UP_URL: z.string(),
	CLERK_SIGN_IN_FORCE_REDIRECT_URL: z.string(),
	CLERK_SIGN_UP_FORCE_REDIRECT_URL: z.string(),
});

export type WebEnv = z.infer<typeof WebEnvSchema>;
export { WebEnvSchema };

declare module "@remix-run/cloudflare" {
	interface AppLoadContext extends ReturnType<typeof getLoadContext> {
		// This will merge the result of `getLoadContext` into the `AppLoadContext`
	}
}

export function getLoadContext({
	context,
}: {
	request: Request;
	context: {
		cloudflare: Omit<
			PlatformProxy<WebEnv, IncomingRequestCfProperties>,
			"dispose" | "caches"
		> & {
			caches:
				| PlatformProxy<WebEnv, IncomingRequestCfProperties>["caches"]
				| CacheStorage;
		};
	};
}) {
	const env = WebEnvSchema.parse(context.cloudflare.env);
	return {
		cloudflare: {
			env: env,
			cf: context.cloudflare.cf,
			ctx: context.cloudflare.ctx,
			cache: context.cloudflare.caches,
		},
	};
}
