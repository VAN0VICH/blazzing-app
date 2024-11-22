import type { WorkerBindings, WorkerEnv } from "@blazzing-app/validators";
import { Context } from "effect";

class Cloudflare extends Context.Tag("Cloudflare")<
	Cloudflare,
	{
		readonly env: WorkerEnv;
		readonly bindings: WorkerBindings;
		readonly request: Request;
		readonly get: (val: string) => string;
	}
>() {}

export { Cloudflare };
