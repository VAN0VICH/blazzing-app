import type { WebBindings, WebEnv } from "@blazzing-app/validators";

declare module "@remix-run/cloudflare" {
	interface AppLoadContext {
		cloudflare: {
			env: WebEnv;
			bindings: WebBindings;
		};
	}
}
