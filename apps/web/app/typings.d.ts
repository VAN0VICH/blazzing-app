// Extend the Window interface
declare global {
	interface Window {
		ENV: {
			REPLICACHE_KEY: string;
			PARTYKIT_HOST: string;
			SERVER_URL: string;
			LIVEKIT_SERVER_URL: string;
		};
	}
}

// This export is needed to convert this file into a module
export type {};
