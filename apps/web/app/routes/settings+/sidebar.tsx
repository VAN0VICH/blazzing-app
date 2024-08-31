import { cn } from "@blazzing-app/ui";
import { Icons, strokeWidth } from "@blazzing-app/ui/icons";
import { Box, Flex } from "@radix-ui/themes";
import { Link, useLocation } from "@remix-run/react";
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
					"hidden md:flex flex-col lg:pl-0 w-44 bg-component opacity-0 md:opacity-100 m-1 md:m-0 justify-between fixed h-[calc(100vh-75px)] rounded-lg md:rounded-none border md:h-full lg:border-r lg:border-t-0 lg:border-l-0 lg:border-b-0 border-border   md:w-40  overflow-hidden md:border-r md:border-border  transition-all duration-200 ease-in-out z-20 ",
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
									"group relative rounded-[7px] flex h-10 w-full items-center gap-3 px-2 cursor-pointer hover:bg-mauve-3 dark:hover:bg-mauve-5",
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
												? "text-accent-9"
												: "group-hover:text-accent-9",
										)}
										size={20}
										strokeWidth={strokeWidth}
									/>
								</Flex>
								<span
									className={cn(
										"relative font-light font-roboto",

										pathname === item.href
											? "text-accent-9"
											: "group-hover:text-accent-9",
									)}
								>
									{item.title}
								</span>
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

export { SettingsSidebar };
