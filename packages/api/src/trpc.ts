import { initTRPC } from "@trpc/server";

// export type TRPCContext = {
// 	env: Env;
// 	request: Request;
// 	authUser: AuthUser | null;
// 	bindings: {
// 		KV: KVNamespace;
// 	};
// };
const t = initTRPC
	.context(
		// <TRPCContext>
	)
	.create();

export const procedure = t.procedure;
export const router = t.router;
export const createCallerFactory = t.createCallerFactory;
