/* tslint:disable */
/* eslint-disable */
import "sst";
declare module "sst" {
	export interface Resource {
		BlazzingWorker: {
			type: "sst.cloudflare.Worker";
			url: string;
		};
		DATABASE_URL: {
			type: "sst.sst.Secret";
			value: string;
		};
		DatabaseURL: {
			type: "sst.sst.Secret";
			value: string;
		};
		Email: {
			sender: string;
			type: "sst.aws.Email";
		};
		Test: {
			type: "sst.sst.Secret";
			value: string;
		};
	}
}
export {};
