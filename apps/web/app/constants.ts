import type { AccentColor } from "./validators/state";

export const SESSION_KEY = "blazzing-session";

export const noSidebarPaths = new Set([
	"/",
	"/sign-in",
	"/sign-up",
	"/onboarding",
	"/error",
]);

export const noHeaderPaths = (pathname: string) => {
	const paths = [
		"/dashboard",
		"/onboarding",
		"/login",
		"/verify",
		"/settings",
		"/error",
	];
	return paths.some((path) => pathname.startsWith(path));
};

export const footerPaths = new Set(["/"]);

type Tag = {
	name: string;
	color: AccentColor;
};
export const tags: Tag[] = [
	{ name: "Accessories", color: "violet" },
	{ name: "Electronics", color: "blue" },
	{ name: "Books", color: "amber" },
	{ name: "Sports", color: "green" },
	{ name: "Fashion", color: "pink" },
	{ name: "Animals", color: "orange" },
];
