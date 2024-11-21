import { Context } from "effect";

import type { Db, Transaction } from "@blazzing-app/db";

class Database extends Context.Tag("Database")<
	Database,
	{
		readonly manager: Transaction | Db;
	}
>() {}

export { Database };
