import { cn } from "@blazzing-app/ui";
import { Box } from "@radix-ui/themes";
import { useLocation } from "@remix-run/react";
import { noSidebarPaths } from "~/constants";
import { useUserPreferences } from "~/hooks/use-user-preferences";

export function SidebarLayoutWrapper({
	children,
}: {
	children: React.ReactNode;
}) {
	const location = useLocation();
	const { sidebarState } = useUserPreferences();
	const mode = sidebarState ?? "closed";

	return (
		<Box
			className={cn("min-w-full transition-all duration-200 ease-in-out", {
				"lg:pl-[56px]": !noSidebarPaths.has(location.pathname),
				"lg:pl-[176px]":
					!noSidebarPaths.has(location.pathname) && mode === "open",
			})}
		>
			{children}
		</Box>
	);
}
