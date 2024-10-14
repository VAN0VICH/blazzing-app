import { cn } from "@blazzing-app/ui";
import {
	DialogContent,
	DialogRoot,
	DialogTrigger,
} from "@blazzing-app/ui/dialog-vaul";
import { Icons, strokeWidth } from "@blazzing-app/ui/icons";
import { Box, Flex, Heading, IconButton, Text } from "@radix-ui/themes";
import { Link, useLocation } from "@remix-run/react";
import React from "react";
export type SettingsSidebarItem = {
	title: string;
	href: string;
	icon: keyof typeof Icons;
};
const items: SettingsSidebarItem[] = [
	{
		title: "General",
		href: "/settings/general",
		icon: "Customer",
	},
	{
		title: "Appearance",
		href: "/settings/appearance",
		icon: "Paintbrush",
	},
	{
		title: "Premium",
		href: "/settings/premium",
		icon: "Sparkles",
	},
];
const SettingsSidebar = ({ children }: { children: React.ReactNode }) => {
	const { pathname } = useLocation();

	return (
		<Flex position="relative" inset="0">
			<nav
				className={cn(
					"hidden md:flex flex-col lg:pl-0 bg-component opacity-0 md:opacity-100 m-1 md:m-0 justify-between fixed h-[calc(100vh-75px)] rounded-lg md:rounded-none border md:h-full lg:border-r lg:border-t-0 lg:border-l-0 lg:border-b-0 border-border  w-40  overflow-hidden md:border-r md:border-border  transition-all duration-200 ease-in-out z-20 ",
				)}
			>
				<Box />
				<Flex justify="center" align="center" direction="column" gap="2" px="1">
					{items.map((item) => {
						const Icon = Icons[item.icon ?? "chevronLeft"];

						return (
							<Link
								to={item.href}
								prefetch="viewport"
								key={item.title}
								className={cn(
									"group relative flex h-10 w-full items-center gap-3 px-2 cursor-pointer rounded-[5px] hover:bg-accent-3",
								)}
							>
								{item.title === "Orders" && (
									<div className="absolute top-0 text-white text-sm flex items-center justify-center right-0 w-5 h-5 rounded-full bg-accent-9">
										1
									</div>
								)}
								<Flex justify="center">
									<Icon
										className={cn(
											pathname === item.href
												? "text-accent-11"
												: "group-hover:text-accent-11",
										)}
										size={20}
										strokeWidth={strokeWidth}
									/>
								</Flex>
								<Heading
									size="3"
									className={cn(
										"relative font-freeman font-light",

										pathname === item.href
											? "text-accent-11"
											: "group-hover:text-accent-11",
									)}
								>
									{item.title}
								</Heading>
							</Link>
						);
					})}
				</Flex>
				<Box />
				<Box />
			</nav>
			{children}
		</Flex>
	);
};
export const SettingsSidebarMobile = () => {
	const { pathname } = useLocation();

	const [opened, setOpened] = React.useState(false);
	return (
		<DialogRoot
			shouldScaleBackground={true}
			open={opened}
			onOpenChange={setOpened}
			direction="left"
		>
			<DialogTrigger asChild>
				<IconButton
					variant="ghost"
					className={cn("absolute top-4 left-4 z-50 md:hidden")}
				>
					<Icons.Menu size={20} strokeWidth={strokeWidth} />
				</IconButton>
			</DialogTrigger>
			<DialogContent className="w-72 md:hidden bg-component m-0 rounded-none">
				<nav className={cn("flex flex-col px-1 w-full py-2")}>
					<ul className="justify-center items-center flex w-full flex-col gap-2 py-2">
						{items.map((item) => {
							const Icon = Icons[item.icon ?? "chevronLeft"];

							return (
								<Link
									to={item.href}
									prefetch="viewport"
									key={item.title}
									onClick={() => setOpened(false)}
									className={cn(
										"group relative   flex h-12 lg:8 w-full items-center gap-3 px-2 cursor-pointer dark:hover:bg-component hover:bg-accent-3 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-accent-7",
										{
											"bg-component hover:bg-gray-3 dark:hover:bg-border hover:border-t- gray-7 border border-border":
												pathname === item.href,
										},
									)}
								>
									{item.title === "Orders" && (
										<div className="absolute top-0 font-extralight text-white text-sm flex items-center justify-center right-0 w-5 h-5 rounded-full bg-accent-9">
											1
										</div>
									)}
									<Flex justify="center">
										<Icon
											className={cn(
												pathname === item.href
													? "text-accent-11"
													: "text- gray-11 group-hover:text-accent-11",
											)}
											size={20}
											strokeWidth={strokeWidth}
										/>
									</Flex>
									<Text
										className={cn(
											"relative text- gray-11 font-light",

											pathname === item.href
												? "text-accent-11"
												: "text- gray-11 group-hover:text-accent-11",
										)}
									>
										{item.title}
									</Text>
								</Link>
							);
						})}
					</ul>
					<Box />
					<Box />
				</nav>
			</DialogContent>
		</DialogRoot>
	);
};

export { SettingsSidebar };
