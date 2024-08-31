import { create } from "zustand";
interface GalleryState {
	opened: boolean;
	setOpened(newValue: boolean): void;
}

const useGalleryState = create<GalleryState>((set) => ({
	opened: false,
	setOpened: (open) => set({ opened: open }),
}));

interface CartState {
	opened: boolean;
	setOpened(newValue: boolean): void;
}
const useCartState = create<CartState>((set) => ({
	opened: false,
	setOpened: (open) => set({ opened: open }),
}));

interface DashboardState {
	opened: boolean;
	setOpened(newValue: boolean): void;
}

const useDashboardState = create<DashboardState>((set) => ({
	opened: false,
	setOpened: (open) => set({ opened: open }),
}));

export { useCartState, useGalleryState, useDashboardState };
