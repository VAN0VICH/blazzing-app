import type { WorkerBindings, WorkerEnv } from "@blazzing-app/validators";
import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { logger } from "hono/logger";
import { AuctionApi } from "./api/auction";
import { AuthApi } from "./api/auth";
import { CartApi } from "./api/cart";
import { HelloApi } from "./api/hello";
import { OrderApi } from "./api/order";
import { ProductApi } from "./api/product";
import { ReplicacheApi } from "./api/replicache";
import { StoreApi } from "./api/store";
import { UserApi } from "./api/user";
import { PaymentApi } from "./api/payment";
import { VariantApi } from "./api/variant";

const app = new OpenAPIHono<{ Bindings: WorkerBindings & WorkerEnv }>();

app
	.use(logger())
	.use("*", async (c, next) => {
		const wrapped = cors({
			origin:
				c.env.ENVIRONMENT === "production"
					? "https://blazzing.app"
					: [
							"http://localhost:5173",
							"https://development.blazzing-app.pages.dev",
							"https://blazzing-app.com",
							"http://localhost:8788",
						],

			allowMethods: ["POST", "GET", "OPTIONS", "DELETE", "PUT"],
			maxAge: 600,
		});
		return wrapped(c, next);
	})
	.use("*", async (c, next) => {
		const wrapped = csrf({
			origin:
				c.env.ENVIRONMENT === "production"
					? "https://blazzing.app"
					: [
							"http://localhost:5173",
							"https://development.blazzing-app.pages.dev",
							"https://blazzing-app.com",
							"http://localhost:8788",
						],
		});
		return wrapped(c, next);
	});

const routes = app
	.route("/hello", HelloApi.route)
	.route("/auction", AuctionApi.route)
	.route("/auth", AuthApi.route)
	.route("/user", UserApi.route)
	.route("/replicache", ReplicacheApi.route)
	.route("/store", StoreApi.route)
	.route("/product", ProductApi.route)
	.route("/variant", VariantApi.route)
	.route("/cart", CartApi.route)
	.route("/order", OrderApi.route)
	.route("/payment", PaymentApi.route);
app.doc("/doc", () => ({
	openapi: "3.0.0",
	info: {
		title: "Blazzing app API",
		version: "0.0.1",
	},
}));

export type Routes = typeof routes;
export default app;
