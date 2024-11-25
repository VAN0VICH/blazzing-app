import { useSubscribe } from "replicache-react";
import { useReplicache } from "../zustand/replicache";
import type { StoreUser } from "@blazzing-app/validators";
export function useUser(): StoreUser | undefined {
	const rep = useReplicache((state) => state.globalRep);
	const user = useSubscribe(
		rep,
		async (tx) => {
			const result = await tx
				.scan<StoreUser>({ prefix: "user" })
				.values()
				.toArray();
			const [value] = result;
			return value;
		},
		{ default: undefined, dependencies: [rep] },
	);
	return user as StoreUser | undefined;
}
