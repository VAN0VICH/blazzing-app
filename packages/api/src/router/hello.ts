import { procedure, router } from "../trpc";

const helloRouter = router({
	hello: procedure.query(() => {
		return "hello from trpc";
	}),
});

export { helloRouter };
