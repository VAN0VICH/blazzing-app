import type {
	AuthSession,
	WebBindings,
	WorkerBindings,
	WebEnv,
	WorkerEnv,
} from "@blazzing-app/validators";
import { TimeSpan, createDate, isWithinExpirationDate } from "oslo";
export const SESSION_KEY = "blazzing-app-session";

export const Authentication = ({
	env,
	request,
	sessionExpiresIn = new TimeSpan(30, "d"),
	sessionKey = SESSION_KEY,
	bindings,
}: {
	env: WebEnv | WorkerEnv;
	bindings: WebBindings | WorkerBindings;
	request: Request;
	sessionExpiresIn?: TimeSpan;
	sessionKey?: string;
}) => {
	return {
		sessionKey,
		validateSession: async (sessionID: string) => {
			const { session, user } = await createCaller({
				env,
				authUser: null,
				request,
				bindings,
			}).auth.userAndSession({ sessionID });

			if (!session) {
				return { user: null, session: null };
			}

			const expirationDate = new Date(session.expiresAt);
			const activePeriodExpirationDate = new Date(
				expirationDate.getTime() - sessionExpiresIn.milliseconds() / 2,
			);

			if (!isWithinExpirationDate(expirationDate)) {
				await createCaller({
					env,
					authUser: null,
					request,
					bindings,
				}).auth.deleteSession({
					sessionID,
				});
				return { user: null, session: null };
			}

			const currentSession: AuthSession = {
				...session,
				fresh: isWithinExpirationDate(activePeriodExpirationDate),
			};

			return { user, session: currentSession };
		},
		createSession: async (authID: string) => {
			const expiresAt = createDate(sessionExpiresIn);
			const session = await createCaller({
				env,
				request,
				authUser: null,
				bindings,
			}).auth.createSession({
				authID,
				expiresAt: expiresAt.toISOString(),
			});

			return { ...session, fresh: true };
		},
		invalidateSession: (sessionID: string) => {
			return createCaller({
				env,
				authUser: null,
				request,
				bindings,
			}).auth.deleteSession({
				sessionID,
			});
		},
		deleteExpiredSessions: () => {
			return createCaller({
				env,
				authUser: null,
				request,
				bindings,
			}).auth.deleteExpiredSessions();
		},
		readBearerToken: (authorizationHeader: string) => {
			const [authScheme, token] = authorizationHeader.split(" ") as [
				string,
				string | undefined,
			];
			if (authScheme !== "Bearer") {
				return null;
			}
			return token ?? null;
		},
	};
};
