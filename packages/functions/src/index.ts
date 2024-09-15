import { OpenAPIHono } from "@hono/zod-openapi";
import { logger } from "hono/logger";
import { HelloApi } from "./api/hello";
import { AuctionApi } from "./api/auction";

const app = new OpenAPIHono();

app.use(logger());

const routes = app
	.route("/hello", HelloApi.route)
	.route("/auction", AuctionApi.route);

app.doc("/doc", () => ({
	openapi: "3.0.0",
	info: {
		title: "Blazzing app API",
		version: "0.0.1",
	},
}));

export type Routes = typeof routes;
export default app;
