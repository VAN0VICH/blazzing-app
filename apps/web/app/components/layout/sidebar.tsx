import { cn } from "@blazzing-app/ui";
import { Icons, strokeWidth } from "@blazzing-app/ui/icons";
import {
	Box,
	Card,
	Dialog,
	Flex,
	Heading,
	IconButton,
	Kbd,
} from "@radix-ui/themes";
import { Link, useFetcher, useLocation } from "@remix-run/react";
import React from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useUserPreferences } from "~/hooks/use-user-preferences";
import type { action } from "~/routes/action+/set-preferences";
export type SidebarItem = {
	title: string;
	href: string;
	icon: keyof typeof Icons;
	items: [];
};
const items: SidebarItem[] = [
	{
		title: "Dashboard",
		href: "/dashboard",
		icon: "Dashboard",
		items: [],
	},
	{
		title: "Marketplace",
		href: "/marketplace",
		icon: "Marketplace",
		items: [],
	},
	{
		title: "Auctions",
		href: "/auction",
		icon: "Billing",
		items: [],
	},

	{
		title: "Settings",
		href: "/settings/general",
		icon: "Settings",
		items: [],
	},
];

const noSidebarPaths = new Set(["/", "/onboarding", "/login", "/verify"]);

const Sidebar = () => {
	const fetcher = useFetcher<typeof action>();
	const { sidebarState } = useUserPreferences();
	const mode = sidebarState ?? "open";
	const nextMode = mode === "open" ? "closed" : "open";
	const location = useLocation();
	useHotkeys(["s"], () => {
		fetcher.submit(
			{ sidebarState: nextMode },
			{
				method: "post",
				action: "/action/set-preferences",
			},
		);
	});
	const splitPath = location.pathname.split("/");
	const mainPath = splitPath[1];
	return (
		<Flex>
			<nav
				className={cn(
					"hidden group top-0 h-full  bg-component justify-between lg:flex flex-col fixed z-40 w-14 overflow-hidden transition-all duration-200 ease-in-out hover:w-44",
					{
						"w-44": mode === "open",
						"hidden lg:hidden": noSidebarPaths.has(location.pathname),
						"bg-gray-3": location.pathname.startsWith("/dashboard"),
					},
				)}
			>
				<Box className="bg-component border-r border-border w-full h-full px-2 border-t-0 border-b-0 border-l-0 rounded-none">
					<Flex
						className={cn(
							"w-full justify-center pt-2 group-hover:justify-end group-hover:pr-2",
							{
								"justify-end pr-2": mode === "open",
							},
						)}
					>
						<Kbd
							size="4"
							className="cursor-pointer"
							onClick={() =>
								fetcher.submit(
									{ sidebarState: nextMode },
									{
										method: "POST",
										action: "/action/set-preferences",
									},
								)
							}
						>
							S
						</Kbd>
					</Flex>
					<Box />
					<Flex
						direction="column"
						justify="center"
						align="center"
						gap="1"
						pt="7"
					>
						{items.map((item) => {
							const Icon = Icons[item.icon ?? "chevronLeft"];
							const Nav = location.pathname.startsWith(item.href)
								? "div"
								: Link;

							return (
								<Nav
									to={item.href}
									key={item.title}
									className={cn(
										"group/link flex size-10 w-full items-center gap-3 pl-3 hover:bg-accent-3 rounded-[5px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-accent-7",
									)}
									prefetch="viewport"
								>
									<Flex justify="center" align="center">
										<Icon
											className={cn(
												"size-5",
												`/${mainPath}` === item.href
													? "text-accent-11"
													: "group-hover/link:text-accent-11",
											)}
											strokeWidth={strokeWidth}
										/>
									</Flex>
									<Heading
										size="3"
										className={cn(
											"w-[350px] font-freeman font-normal opacity-0 group-hover/link:text-accent-11 transition-opacity duration-300 ease-in-out lg:group-hover:opacity-100",

											`/${mainPath}` === item.href && "text-accent-11",
											mode === "open" ? "opacity-100" : "opacity-0",
										)}
									>
										{item.title}
									</Heading>
								</Nav>
							);
						})}
					</Flex>
					<Box />
				</Box>
			</nav>
		</Flex>
	);
};

const MobileSidebar = () => {
	const location = useLocation();
	// const windowSize = useWindowSize(100);

	return (
		<Flex>
			<nav
				className={cn(
					"fixed lg:hidden h-14 group bottom-0 w-[calc(100%-6px)] bg-component justify-between flex flex-col z-40 overflow-hidden backdrop-blur-sm border-t border-border",
					{
						hidden: noSidebarPaths.has(location.pathname),
					},
				)}
			>
				<Flex justify="between" align="center" gap="2" height="100%" px="4">
					<DialogSidebar />
					{/* {windowSize.width < 1024 && <GlobalSearchCombobox />} */}
				</Flex>
			</nav>
		</Flex>
	);
};
export const DialogSidebar = () => {
	const location = useLocation();
	const splitPath = location.pathname.split("/");
	const mainPath = splitPath[1];
	const [opened, setOpened] = React.useState(false);
	return (
		<Dialog.Root open={opened} onOpenChange={setOpened}>
			<Dialog.Trigger className="flex justify-center items-center">
				<IconButton variant="ghost">
					<Icons.Menu />
				</IconButton>
			</Dialog.Trigger>

			<Dialog.Content maxWidth="450px" className="p-3 backdrop-blur-sm">
				<Flex direction="column" justify="center" align="center" gap="1">
					{items.map((item) => {
						const Icon = Icons[item.icon ?? "chevronLeft"];
						const Nav = location.pathname.startsWith(item.href) ? "div" : Link;

						return (
							<Nav
								to={item.href}
								key={item.title}
								className={cn(
									"group/link flex h-14 w-full items-center gap-3 hover:bg-gray-3 rounded-[5px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-accent-7",
								)}
								prefetch="viewport"
								onClick={() => setOpened(false)}
							>
								<Flex justify="end" width="40px" align="center">
									<Icon
										className={cn(
											`/${mainPath}` === item.href
												? "text-accent-11"
												: "text- gray-11 group-hover/link:text-accent-11",
										)}
										size={20}
										strokeWidth={strokeWidth}
									/>
								</Flex>
								<Heading
									size="3"
									className={cn(
										"font-normal group-hover/link:text-accent-11",

										`/${mainPath}` === item.href && "text-accent-11",
									)}
								>
									{item.title}
								</Heading>
							</Nav>
						);
					})}
				</Flex>
			</Dialog.Content>
		</Dialog.Root>
	);
};

export { MobileSidebar, Sidebar };
