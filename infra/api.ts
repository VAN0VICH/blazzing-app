import { domain } from "./dns";
import { secret } from "./secret";

export const api = new sst.cloudflare.Worker("BlazzingWorker", {
	handler: "./packages/functions/src/api/index.ts",
	link: [secret.DatabaseURL],
	url: true,
	domain: `api.${domain}`,
});
export const outputs = {
	openapi: api.url,
};
