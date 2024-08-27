import { z } from "zod";

export type SidebarState = "open" | "closed";
export const SidebarSchema = z.object({
	sidebarState: z.enum(["open", "closed"]),
});
export type Theme = "inherit" | "light" | "dark";
export const ThemeSchema = z.object({
	theme: z.enum(["inherit", "light", "dark"]),
});
