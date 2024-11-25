import type {
	WebEnv,
	WebBindings,
	Server,
	AuthSession,
} from "@blazzing-app/validators";
import type { Session, SessionData } from "@remix-run/cloudflare";

declare module "@remix-run/cloudflare" {
	interface AppLoadContext {
		cloudflare: {
			env: WebEnv;
			bindings: WebBindings;
		};
		authUser: Server.AuthUser | null;
		session: Session<SessionData, SessionData>;
		userSession: AuthSession;
	}
}
