import type { User } from "@blazzing-app/validators/client";
import { useSubscribe } from "replicache-react";
import { useReplicache } from "../zustand/replicache";
export function useUser(): User | null {
	const rep = useReplicache((state) => state.globalRep);
	const user = useSubscribe(
		rep,
		async (tx) => {
			const result = await tx.scan<User>({ prefix: "user" }).values().toArray();
			const [value] = result;
			return value ?? null;
		},
		{ default: null, dependencies: [rep] },
	);
	return user as User | null;
}
