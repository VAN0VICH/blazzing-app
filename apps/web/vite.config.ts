import {
	vitePlugin as remix,
	cloudflareDevProxyVitePlugin as remixCloudflareDevProxy,
} from "@remix-run/dev";
import { flatRoutes } from "remix-flat-routes";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	ssr: {
		noExternal: ["react-easy-crop", "tslib", "react-dropzone"],
		resolve: {
			externalConditions: ["workerd", "worker"],
		},
	},
	plugins: [
		remixCloudflareDevProxy({}),

		// MillionLint.vite(),
		remix({
			future: {
				v3_fetcherPersist: true,
				v3_relativeSplatPath: true,
				v3_throwAbortReason: true,
				v3_singleFetch: true,
				v3_lazyRouteDiscovery: true,
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
