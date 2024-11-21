import {
	WebEnvSchema,
	type WebBindings,
	type WebEnv,
} from "@blazzing-app/validators";
import type { AppLoadContext, RequestHandler } from "@remix-run/cloudflare";
import { createWorkersKVSessionStorage } from "@remix-run/cloudflare";
import { Hono } from "hono";
import { staticAssets } from "remix-hono/cloudflare";
import { remix } from "remix-hono/handler";
import { getSession, session } from "remix-hono/session";
import { getUserAndSession } from "./get-user";

const app = new Hono<{ Bindings: WebBindings & WebEnv }>();
let handler: RequestHandler | undefined;

app
	.use(
		"*",
		session({
			autoCommit: true,
			createSessionStorage(c) {
				return createWorkersKVSessionStorage({
					kv: c.env.KV,
					cookie: {
						name: "auth_session",
						httpOnly: true,
						secrets: [c.env.SESSION_SECRET ?? "WEAK_SECRET"],
						secure: c.env.ENVIRONMENT === "production",
					},
				});
			},
		}),
	)
	.use(
		async (c, next) => {
			if (process.env.NODE_ENV !== "development" || import.meta.env.PROD) {
				return staticAssets()(c, next);
			}
			await next();
		},
		async (c, next) => {
			if (process.env.NODE_ENV !== "development" || import.meta.env.PROD) {
				//@ts-ignore
				const serverBuild = await import("../build/server");
				const session = getSession(c);
				const env = WebEnvSchema.parse(c.env);
				const { session: userSession, user } = await getUserAndSession(
					c,
					session,
				);

				const remixContext = {
					cloudflare: {
						env,
						bindings: c.env.KV,
					},
					session,
					userSession,
					authUser: user,
				} as unknown as AppLoadContext;
				return remix({
					//@ts-ignore
					build: serverBuild,
					mode: "production",
					getLoadContext() {
						return remixContext;
					},
				})(c, next);
				// biome-ignore lint/style/noUselessElse: <explanation>
			} else {
				const session = getSession(c);
				const env = WebEnvSchema.parse(c.env);
				console.log("hello");

				const { session: userSession, user } = await getUserAndSession(
					c,
					session,
				);

				const remixContext = {
					cloudflare: {
						env,
						bindings: c.env.KV,
					},
					session,
					userSession,
					authUser: user,
				} as unknown as AppLoadContext;
				if (!handler) {
					// @ts-expect-error it's not typed
					const build = await import("virtual:remix/server-build");
					const { createRequestHandler } = await import(
						"@remix-run/cloudflare"
					);
					handler = createRequestHandler(build, "development");
				}
				return handler(c.req.raw, remixContext);
			}
		},
	);
export default app;
