/// <reference path="./.sst/platform/config.d.ts" />
import { readdirSync } from "node:fs";
export default $config({
	app(input) {
		return {
			name: "blazzing-app",
			removal: input?.stage === "production" ? "retain" : "remove",
			home: "aws",
			providers: {
				aws: {
					region: "ap-southeast-2",
					profile: process.env.GITHUB_ACTIONS
						? undefined
						: input.stage === "production"
							? "blazzing-production"
							: "blazzing-development",
				},
				cloudflare: true,
				"pulumi-stripe": true,
			},
		};
	},
	async run() {
		$transform(cloudflare.WorkerScript, (script) => {
			script.logpush = true;
		});
		sst.Linkable.wrap(cloudflare.Record, (record) => {
			return {
				properties: {
					url: $interpolate`https://${record.name}`,
				},
			};
		});
		const outputs = {};
		for (const value of readdirSync("./infra/")) {
			const result = await import(`./infra/${value}`);
			if (result.outputs) Object.assign(outputs, result.outputs);
		}
		return outputs;
	},
});
