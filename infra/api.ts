import { domain } from "./dns";
import { secret } from "./secret";

export const api = new sst.cloudflare.Worker("BlazzingWorker", {
	handler: "./packages/functions/src/api/index.ts",
	link: [secret.DatabaseURL],
	url: true,
	domain: `api.${domain}`,

	transform: {
		worker: {
			compatibilityFlags: ["nodejs_compat_v2"],
			name: "blazzing-worker",
			accountId: "3551fbe61550836037b63f206e50bc73",
			content: "Blazzing worker",
		},
	},
});
export const outputs = {
	openapi: api.url,
};
