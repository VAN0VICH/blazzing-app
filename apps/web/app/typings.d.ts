// Extend the Window interface
declare global {
	interface Window {
		ENV: {
			REPLICACHE_KEY: string;
			PARTYKIT_HOST: string;
			WORKER_URL: string;
			BLAZZING_PUBLISHABLE_KEY: string;
		};
	}
}

// This export is needed to convert this file into a module
export type {};
