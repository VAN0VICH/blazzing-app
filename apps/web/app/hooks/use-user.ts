import type { User } from "@blazzing-app/validators/client";
import { useSubscribe } from "replicache-react";
import { useReplicache } from "../zustand/replicache";
export function useUser(): User | undefined {
	const rep = useReplicache((state) => state.globalRep);
	const user = useSubscribe(
		rep,
		async (tx) => {
			const result = await tx.scan<User>({ prefix: "user" }).values().toArray();
			const [value] = result;
			return value;
		},
		{ default: undefined, dependencies: [rep] },
	);
	return user as User | undefined;
}
