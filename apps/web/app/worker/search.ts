import Fuse from "fuse.js";

interface Document {
	id: string;
	title?: string;
	description?: string;
}
type SearchWorkerResponse = {
	type:
		| "GLOBAL_SEARCH"
		| "DASHBOARD_SEARCH"
		| "PRODUCT_SEARCH"
		| "ORDER_SEARCH"
		| "CUSTOMER_SEARCH";
	payload: Document[];
};
type SearchWorkerRequest = {} & (
	| {
			type: "ADD";
			payload: {
				document: Document;
			};
	  }
	| {
			type: "UPDATE";
			payload: {
				document: Document;
			};
	  }
	| {
			type: "DELETE";
			payload: {
				key: string;
			};
	  }
	| {
			type:
				| "GLOBAL_SEARCH"
				| "DASHBOARD_SEARCH"
				| "ORDER_SEARCH"
				| "CUSTOMER_SEARCH"
				| "PRODUCT_SEARCH";
			payload: {
				query: string;
			};
	  }
);

const fuse = new Fuse<Document>([], {
	keys: [
		"title",
		"description",
		"fullName",
		"name",
		"email",
		"username",
		"phone",
	],
});
self.onmessage = (event: MessageEvent<SearchWorkerRequest>) => {
	const { type, payload } = event.data;

	if (type === "ADD") {
		fuse.add(payload.document);
	}
	if (type === "UPDATE") {
		fuse.remove((item) => item.id === payload.document.id);
		fuse.add(payload.document);
	}
	if (type === "DELETE") {
		fuse.remove((item) => item.id === payload.key);
	}
	if (
		type === "DASHBOARD_SEARCH" ||
		type === "ORDER_SEARCH" ||
		type === "CUSTOMER_SEARCH" ||
		type === "PRODUCT_SEARCH" ||
		type === "GLOBAL_SEARCH"
	) {
		const results = fuse.search(payload.query);
		console.log("results", results);
		console.log("type", type);
		postMessage({ type, payload: results.map((r) => r.item) });
	}
};

export type { SearchWorkerRequest, Document, SearchWorkerResponse };
