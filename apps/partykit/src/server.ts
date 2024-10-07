import type * as Party from "partykit/server";
import { z } from "zod";
const messageSchema = z.array(z.string());
export default class WebSocketServer implements Party.Server {
	options: Party.ServerOptions = {
		hibernate: true,
	};
	constructor(readonly room: Party.Room) {}
	async onRequest(request: Party.Request) {
		// push new message
		if (request.method === "POST") {
			const parsed = messageSchema.safeParse(await request.json());
			if (!parsed.success) {
				return new Response("Invalid message", { status: 405 });
			}
			console.log("broadcasting", JSON.stringify(parsed.data));

			this.room.broadcast(JSON.stringify(parsed.data));
			return new Response("OK");
		}

		return new Response("Method not allowed", { status: 405 });
	}
}
