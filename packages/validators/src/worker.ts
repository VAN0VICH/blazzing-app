type WorkerBindings = {
	KV: KVNamespace;
};
type WorkerEnv = {
	WORKER_URL: string;
	WEB_URL: string;
	DATABASE_URL: string;
	PARTYKIT_ORIGIN: string;
	SESSION_SECRET?: string;
	ENVIRONMENT: "development" | "production" | "staging";
	IMAGE_API_TOKEN: string;
	ACCOUNT_ID: string;
	STRIPE_SECRET_KEY: string;
	STRIPE_WEBHOOK_SECRET: string;
	BLAZZING_PUBLISHABLE_KEY: string;
};

export type { WorkerBindings, WorkerEnv };
