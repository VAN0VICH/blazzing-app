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
import { GeneralErrorBoundary } from "./components/error-boundary";
import { Header } from "./components/layout/header";
import { Toploader } from "./components/top-loader";
// import { MobileSidebar, Sidebar } from "./components/layout/sidebar";
import { Toaster } from "@blazzing-app/ui/toaster";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import "./tailwind.css";
import { MobileSidebar, Sidebar } from "./components/layout/sidebar";
import { ClientHintCheck, getHints } from "./hooks/use-hints";
import { useNonce } from "./hooks/use-nonce";
import { useTheme } from "./hooks/use-theme";
import { prefs, userContext } from "./sessions.server";
import sonnerStyles from "./sonner.css?url";
import { getDomainUrl } from "./utils/helpers";
import type { AccentColor, Theme as ThemeType } from "./validators/state";
import vaulStyles from "./vaul.css?url";
import { useAccentColor } from "./hooks/use-accent-color";
export const links: LinksFunction = () => {
	return [
		// Preload svg sprite as a resource to avoid render blocking
		//TODO: ADD ICON
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
			accentColor?: AccentColor;
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
				accentColor: prefsCookie.accentColor,
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
	const accentColor = useAccentColor();

	return (
		<Document nonce={nonce} env={data.ENV} theme={theme}>
			<Theme
				accentColor={accentColor}
				grayColor="mauve"
				radius="medium"
				className="h-full w-full"
				panelBackground="solid"
				appearance={theme}
			>
				<Toploader />
				<Sidebar />
				<MobileSidebar />
				<Header />
				<Outlet />
				<Toaster />
			</Theme>
		</Document>
	);
}

export default App;

function Document({
	children,
	nonce,
	env = {},
	allowIndexing = true,
	theme,
}: {
	children: React.ReactNode;
	nonce: string;
	env?: Record<string, string>;
	allowIndexing?: boolean;
	theme: ThemeType;
}) {
	return (
		<html lang="en" className={`${theme} `}>
			<head>
				<ClientHintCheck nonce={nonce} />
				{/* <link rel="icon" href="/assets/Logo.png" type="image/png" /> */}
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
	const theme = useTheme();

	// NOTE: you cannot use useLoaderData in an ErrorBoundary because the loader
	// likely failed to run so we have to do the best we can.
	// We could probably do better than this (it's possible the loader did run).
	// This would require a change in Remix.

	// Just make sure your root route never errors out and you'll always be able
	// to give the user a better UX.

	return (
		<Document nonce={nonce} theme={theme}>
			<GeneralErrorBoundary />
		</Document>
	);
}
