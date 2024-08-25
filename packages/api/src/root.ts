import { helloRouter } from "./router/hello";
import { router } from "./trpc";

export const appRouter = router({
	hello: helloRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
