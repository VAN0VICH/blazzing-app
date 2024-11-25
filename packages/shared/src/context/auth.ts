import type { Server } from "@blazzing-app/validators";
import { Context } from "effect";

class AuthContext extends Context.Tag("Auth")<
	AuthContext,
	{
		readonly authUser: Server.AuthUser | null;
	}
>() {}

export { AuthContext };
