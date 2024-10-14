import { z } from "zod";

export type SidebarState = "open" | "closed";
export const SidebarFormSchema = z.object({
	sidebarState: z.enum(["open", "closed"]),
});
export type Theme = "system" | "light" | "dark";
export const ThemeFormSchema = z.object({
	theme: z.enum(["system", "light", "dark"]),
});
