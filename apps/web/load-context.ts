import type {
	WebEnv,
	WebBindings,
	AuthUser,
	AuthSession,
} from "@blazzing-app/validators";
import type { Session, SessionData } from "@remix-run/cloudflare";
// When using `wrangler.toml` to configure bindings,
// `wrangler types` will generate types for those bindings
// into the global `Env` interface.
// Need this empty interface so that typechecking passes
// even if no `wrangler.toml` exists.
// eslint-disable-next-line @typescript-eslint/no-empty-interface

declare module "@remix-run/cloudflare" {
	interface AppLoadContext {
		cloudflare: {
			env: WebEnv;
			bindings: WebBindings;
		};
		authUser: AuthUser | null;
		session: Session<SessionData, SessionData>;
		userSession: AuthSession;
	}
}
