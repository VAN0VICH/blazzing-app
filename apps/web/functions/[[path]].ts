import { handle } from "hono/cloudflare-pages";
import hono from "../hono-server";

export const onRequest = handle(hono);
