import { z } from "zod";

export const SidebarStateSchema = z.object({
	sidebarState: z.enum(["open", "closed"]),
});

export type SidebarState = z.infer<typeof SidebarStateSchema>["sidebarState"];
export type Theme = "inherit" | "light" | "dark";
export const ThemeSchema = z.object({
	theme: z.enum(["inherit", "light", "dark"]),
});

export const accentColors = [
	"ruby",
	"indigo",
	"cyan",
	"crimson",
	"amber",
	"blue",
	"bronze",
	"green",
	"lime",
	"orange",
	"pink",
	"violet",
	"gray",
] as const;
export const AccentColorSchema = z.object({
	color: z.enum(accentColors),
});
export type AccentColor = z.infer<typeof AccentColorSchema>["color"];
