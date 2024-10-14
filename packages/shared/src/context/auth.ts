import type { AuthUser } from "@blazzing-app/validators";
import { Context } from "effect";

class AuthContext extends Context.Tag("Auth")<
	AuthContext,
	{
		readonly authUser: AuthUser | null;
	}
>() {}

export { AuthContext };
