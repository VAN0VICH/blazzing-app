export type AccountBalance = {
	id: string;
	version: number;
	available: {
		amount: number;
		currency: string;
		sourceTypes: {
			card: number;
		};
	}[];
	pending: {
		amount: number;
		currency: string;
		sourceTypes: {
			card: number;
		};
	}[];
};
