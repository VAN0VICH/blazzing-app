import devServer, { defaultOptions } from "@hono/vite-dev-server";
import adapter from "@hono/vite-dev-server/cloudflare";
import { vitePlugin as remix } from "@remix-run/dev";
import { flatRoutes } from "remix-flat-routes";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
// import MillionLint from "@million/lint";

export default defineConfig({
	ssr: {
		noExternal: [
			"react-easy-crop",
			"tslib",
			"react-dropzone",
			"@blazzing-app/utils",
		],
		resolve: {
			externalConditions: ["workerd", "worker"],
		},
	},
	optimizeDeps: {
		entries: ["@blazzing-app/utils"],
	},
	plugins: [
		// remixCloudflareDevProxy({}),
		devServer({
			adapter,
			entry: "/hono-server/index.ts",
			exclude: [...defaultOptions.exclude, "/assets/**", "/app/**"],
			injectClientScript: false,
		}),
		// MillionLint.vite(),
		remix({
			future: {
				v3_fetcherPersist: true,
				v3_relativeSplatPath: true,
				v3_throwAbortReason: true,
			},
			serverModuleFormat: "esm",
			ignoredRouteFiles: ["**/.*"],
			routes: async (defineRoutes) => {
				return flatRoutes("routes", defineRoutes);
			},
		}),
		tsconfigPaths(),
	],
});
