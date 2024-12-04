// sessions.server.tsx

import { createCookie } from "@remix-run/cloudflare";

export const prefs = createCookie("prefs", { httpOnly: true, sameSite: "lax" });

export const userContext = createCookie("user_context", {
	httpOnly: true,
	sameSite: "lax",
});
