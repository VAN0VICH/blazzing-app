import type {
	DashboardMutatorsType,
	GlobalMutatorsType,
} from "@blazzing-app/replicache";
import type { Replicache } from "replicache";
import { create } from "zustand";

interface ReplicacheState {
	globalRep: Replicache<GlobalMutatorsType> | null;
	setGlobalRep: (rep: Replicache<GlobalMutatorsType> | null) => void;
	dashboardRep: Replicache<DashboardMutatorsType> | null;
	setDashboardRep: (rep: Replicache<DashboardMutatorsType> | null) => void;
	marketplaceRep: Replicache | null;
	setMarketplaceRep: (rep: Replicache | null) => void;
}

export const useReplicache = create<ReplicacheState>((set) => ({
	dashboardRep: null,
	setDashboardRep: (rep) => set({ dashboardRep: rep }),
	globalRep: null,
	setGlobalRep: (rep) => set({ globalRep: rep }),
	marketplaceRep: null,
	setMarketplaceRep: (rep) => set({ marketplaceRep: rep }),
}));
