import type { AccentColor } from "./validators/state";

export const noSidebarPaths = new Set([
	"/",
	"/sign-in",
	"/sign-up",
	"/onboarding",
]);

export const noHeaderPaths = (pathname: string) => {
	const paths = ["/dashboard", "/onboarding", "/login", "/verify", "/settings"];
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
