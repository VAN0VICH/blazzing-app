type WorkerBindings = {
	KV: KVNamespace;
};
type WorkerEnv = {
	WORKER_URL: string;
	WEB_URL: string;
	DATABASE_URL: string;
	PARTYKIT_ORIGIN: string;
	ENVIRONMENT: "development" | "production" | "staging";
	IMAGE_API_TOKEN: string;
	ACCOUNT_ID: string;
};

export type { WorkerBindings, WorkerEnv };
