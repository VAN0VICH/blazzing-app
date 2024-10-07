import type { Effect } from "effect";

import type {
	NeonDatabaseError,
	RowsWTableName,
} from "@blazzing-app/validators";
import type { AuthContext, Cloudflare, Database } from "@blazzing-app/shared";
import type { ReplicacheContext } from "../../context";

export type GetRowsWTableName = ({
	fullRows,
}: {
	fullRows: boolean;
}) => Effect.Effect<
	RowsWTableName[],
	NeonDatabaseError,
	Cloudflare | ReplicacheContext | Database | AuthContext
>;
