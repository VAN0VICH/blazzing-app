import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
export namespace HelloApi {
	export const route = new OpenAPIHono().openapi(
		createRoute({
			security: [{ Bearer: [] }],
			method: "get",
			path: "/",
			responses: {
				200: {
					content: {
						"text/html": {
							schema: z.string(),
						},
					},
					description: "Returns Hello World",
				},
			},
		}),
		(c) => {
			return c.text("Hello World");
		},
	);
}
