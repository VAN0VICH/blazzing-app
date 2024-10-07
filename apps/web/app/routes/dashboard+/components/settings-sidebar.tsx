import { cn } from "@blazzing-app/ui";
import { Icons, strokeWidth } from "@blazzing-app/ui/icons";
import { Box, Card, Flex, Text } from "@radix-ui/themes";
import { Link, useLocation } from "@remix-run/react";
export type DashboardSettingsSidebarItem = {
	title: string;
	href: string;
	icon: keyof typeof Icons;
};

const items: DashboardSettingsSidebarItem[] = [
	{
		title: "Store",
		href: "/dashboard/settings/store",

		icon: "Store",
	},
	{
		title: "Payment",
		href: "/dashboard/settings/payment",

		icon: "Payment",
	},
];
export const DashboardSettingsSidebar = () => {
	const { pathname } = useLocation();
	const mainPath = pathname.split("/")[3];

	return (
		<Card className="min-h-[500px] w-[300px]">
			<Box>
				<ul className="justify-center items-center flex w-full flex-col gap-2">
					{items.map((item) => {
						const Icon = Icons[item.icon ?? "chevronLeft"];
						const Nav = pathname === item.href ? "div" : Link;

						return (
							<Nav
								to={item.href}
								prefetch="viewport"
								key={item.title}
								className={cn(
									"group relative font-freeman flex h-10 w-full rounded-[5px] items-center gap-3 px-2 cursor-pointer hover:bg-accent-3 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-accent-7",
									{
										"text-accent-11 bg-gray-3":
											mainPath === item.title.toLowerCase(),
									},
								)}
							>
								{/* {item.title === "Orders" && (
									<div className="absolute top-0 font-extralight text-white text-sm flex items-center justify-center right-0 w-5 h-5 rounded-full bg-accent-9">
										1
									</div>
								)} */}
								<Flex justify="center">
									<Icon
										className={cn(
											mainPath === item.title.toLowerCase()
												? "text-accent-11"
												: "group-hover:text-accent-11",
										)}
										size={20}
										strokeWidth={strokeWidth}
									/>
								</Flex>
								<Text
									className={cn(
										"relative text-sm",

										mainPath === item.title.toLowerCase()
											? "text-accent-11"
											: "group-hover:text-accent-11",
									)}
								>
									{item.title}
								</Text>
							</Nav>
						);
					})}
				</ul>
			</Box>
		</Card>
	);
};
