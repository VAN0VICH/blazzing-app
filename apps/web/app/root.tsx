import {
	json,
	type LinksFunction,
	type LoaderFunction,
} from "@remix-run/cloudflare";
import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useLoaderData,
} from "@remix-run/react";
import {} from "@blazzing-app/ui";
import { GeneralErrorBoundary } from "./components/error-boundary";
import { Toploader } from "./components/top-loader";
import { Header } from "./components/layout/header";
// import { MobileSidebar, Sidebar } from "./components/layout/sidebar";
import { ClientHintCheck, getHints } from "./hooks/use-hints";
import { useNonce } from "./hooks/use-nonce";
import { useTheme } from "./hooks/use-theme";
import { prefs, userContext } from "./sessions.server";
import sonnerStyles from "./sonner.css?url";
import stylesheet from "./tailwind.css?url";
import { getDomainUrl } from "./utils/helpers";
import vaulStyles from "./vaul.css?url";
import "@radix-ui/themes/styles.css";
import type { Theme as ThemeType } from "./validators/state";
import { Toaster } from "@blazzing-app/ui/toaster";
import { Theme } from "@radix-ui/themes";
export const links: LinksFunction = () => {
	return [
		// Preload svg sprite as a resource to avoid render blocking
		//TODO: ADD ICON
		{ rel: "stylesheet", href: stylesheet },
		{ rel: "stylesheet", href: sonnerStyles },
		{ rel: "stylesheet", href: vaulStyles },
	].filter(Boolean);
};
export type RootLoaderData = {
	ENV: Env;
	requestInfo: {
		hints: ReturnType<typeof getHints>;
		origin: string;
		path: string;
		userPrefs: {
			theme?: ThemeType;
			sidebarState?: string;
		};
		userContext: {
			cartID?: string;
		};
	};
};

export const loader: LoaderFunction = async (args) => {
	const { request } = args;

	const cookieHeader = request.headers.get("Cookie");
	const prefsCookie = (await prefs.parse(cookieHeader)) || {};
	const userContextCookie = (await userContext.parse(cookieHeader)) || {};
	return json({
		requestInfo: {
			hints: getHints(request),
			origin: getDomainUrl(request),
			path: new URL(request.url).pathname,
			userPrefs: {
				theme: prefsCookie.theme,
				sidebarState: prefsCookie.sidebarState,
			},
			userContext: {
				cartID: userContextCookie.cartID,
			},
		},
	});
};

function App() {
	const data = useLoaderData<RootLoaderData>();
	const nonce = useNonce();
	const theme = useTheme();

	return (
		<Theme accentColor="ruby" grayColor="mauve" appearance={theme}>
			<Document nonce={nonce} env={data.ENV}>
				<Toploader />
				{/* <Sidebar /> */}
				{/* <MobileSidebar /> */}
				<Header />
				<Outlet />
				<Toaster />
			</Document>
		</Theme>
	);
}

export default App;

function Document({
	children,
	nonce,
	env = {},
	allowIndexing = true,
}: {
	children: React.ReactNode;
	nonce: string;
	env?: Record<string, string>;
	allowIndexing?: boolean;
}) {
	return (
		<html lang="en">
			<head>
				<ClientHintCheck nonce={nonce} />
				<link rel="icon" href="/assets/Logo.png" type="image/png" />
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				{allowIndexing ? null : (
					<meta name="robots" content="noindex, nofollow" />
				)}
				<Meta />
				<Links />
			</head>
			<body className="font-body bg-background min-w-[280px]">
				{children}
				<ScrollRestoration nonce={nonce} />
				<script
					// biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
					dangerouslySetInnerHTML={{
						__html: `window.ENV = ${JSON.stringify(env)}`,
					}}
				/>
				<Scripts nonce={nonce} />
			</body>
		</html>
	);
}
export function ErrorBoundary() {
	// the nonce doesn't rely on the loader so we can access that
	const nonce = useNonce();

	// NOTE: you cannot use useLoaderData in an ErrorBoundary because the loader
	// likely failed to run so we have to do the best we can.
	// We could probably do better than this (it's possible the loader did run).
	// This would require a change in Remix.

	// Just make sure your root route never errors out and you'll always be able
	// to give the user a better UX.

	return (
		<Document nonce={nonce}>
			<GeneralErrorBoundary />
		</Document>
	);
}
