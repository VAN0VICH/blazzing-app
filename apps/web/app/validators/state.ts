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
	"gray",
	"gold",
	"bronze",
	"brown",
	"yellow",
	"amber",
	"orange",
	"tomato",
	"red",
	"ruby",
	"crimson",
	"pink",
	"plum",
	"purple",
	"violet",
	"iris",
	"indigo",
	"blue",
	"cyan",
	"teal",
	"jade",
	"green",
	"grass",
	"lime",
	"mint",
	"sky",
] as const;

export type AccentColor = (typeof accentColors)[number];
export const grayColors = [
	"auto",
	"gray",
	"mauve",
	"slate",
	"sage",
	"olive",
	"sand",
] as const;

export function getMatchingGrayColor(accentColor: AccentColor) {
	switch (accentColor) {
		case "tomato":
		case "red":
		case "ruby":
		case "crimson":
		case "pink":
		case "plum":
		case "purple":
		case "violet":
			return "mauve";
		case "iris":
		case "indigo":
		case "blue":
		case "sky":
		case "cyan":
			return "slate";
		case "teal":
		case "jade":
		case "mint":
		case "green":
			return "sage";
		case "grass":
		case "lime":
			return "olive";
		case "yellow":
		case "amber":
		case "orange":
		case "brown":
		case "gold":
		case "bronze":
			return "sand";
		case "gray":
			return "gray";
	}
}

export const scaling = ["90%", "95%", "100%", "105%", "110%"] as const;
export type Scaling = (typeof scaling)[number];

const radii = ["none", "small", "medium", "large", "full"] as const;
export type Radius = (typeof radii)[number];

export const PreferencesSchema = z.object({
	sidebarState: z.enum(["open", "closed"] as const).optional(),
	theme: z.enum(["inherit", "light", "dark"] as const).optional(),
	accentColor: z.enum(accentColors).optional(),
	scaling: z.enum(scaling).optional(),
	grayColor: z.enum(grayColors).optional(),
	radius: z.enum(radii).optional(),
});

export type Preferences = z.infer<typeof PreferencesSchema>;
