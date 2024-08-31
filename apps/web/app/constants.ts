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
