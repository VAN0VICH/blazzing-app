import { cn } from "@blazzing-app/ui";
import { useLoaderData, useLocation } from "@remix-run/react";
import { noHeaderPaths, noSidebarPaths } from "~/constants";
import { useIsWindowScrolled } from "~/hooks/use-is-window-scrolled";
import type { RootLoaderData } from "~/root";

function Navbar(props: { children: React.ReactNode }) {
	const isScrolled = useIsWindowScrolled();
	const location = useLocation();
	const { requestInfo } = useLoaderData<RootLoaderData>();
	if (noHeaderPaths(location.pathname)) return null;
	return (
		<header
			{...props}
			className={cn(
				"bg-component border-border border-b backdrop-blur-sm fixed px-4 inset-x-0 top-0 z-30 left-1/2 transform -translate-x-1/2  flex items-center justify-between py-2 transition-all duration-300",
				requestInfo.userPrefs.sidebarState === "open" &&
					!noSidebarPaths.has(location.pathname) &&
					isScrolled &&
					"md:ml-[88px] w-4/12",
				isScrolled
					? "mt-4 h-14 w-11/12 px-6 dark:shadow-gray-7 rounded-[7px] border md:h-14 md:w-8/12 lg:w-2/3 "
					: "h-16 w-full xl:px-40",
			)}
		/>
	);
}

export { Navbar };
