import { cn } from "@blazzing-app/ui";
import {
	DialogContent,
	DialogRoot,
	DialogTrigger,
} from "@blazzing-app/ui/dialog-vaul";
import { Icons, strokeWidth } from "@blazzing-app/ui/icons";
import {
	Avatar,
	Box,
	Flex,
	Heading,
	IconButton,
	Select,
	Text,
} from "@radix-ui/themes";
import { Link, useLocation } from "@remix-run/react";
import React from "react";

export type DashboardSidebarItem = {
	title: string;
	href: string;
	icon: keyof typeof Icons;
};

const items: DashboardSidebarItem[] = [
	{
		title: "Store",
		href: "/dashboard/store",

		icon: "Store",
	},
	{
		title: "Products",
		href: "/dashboard/products",
		icon: "Product",
	},
	{
		title: "Orders",
		href: "/dashboard/orders",
		icon: "Billing",
	},
	{
		title: "Customers",
		href: "/dashboard/customers",
		icon: "Customer",
	},
	{
		title: "Auction",
		href: "/dashboard/auction",
		icon: "Auction",
	},
	{
		title: "Settings",
		href: "/dashboard/settings/store",
		icon: "Settings",
	},
];
interface DashboardSidebarProps {
	children: React.ReactNode;
}
const DashboardSidebar = ({ children }: DashboardSidebarProps) => {
	const { pathname } = useLocation();
	const mainPath = pathname.split("/")[2];
	console.log("pathname", pathname);

	return (
		<Flex width="100%" height="100%" position="relative" inset="0">
			<nav
				className={cn(
					"hidden md:flex flex-col px-2 w-44 opacity-0 shadow-sm md:opacity-100 m-1 md:m-0 fixed top-0  rounded-none h-full border-r border-border md:w-40  overflow-hidden md:border-border transition-all duration-200 ease-in-out z-20 ",
				)}
			>
				<StoreInfo />
				<ul className="justify-center py-2 items-center flex w-full flex-col gap-2">
					{items.map((item) => {
						const Icon = Icons[item.icon ?? "chevronLeft"];
						const Nav = pathname === item.href ? "div" : Link;

						return (
							<Nav
								to={item.href}
								prefetch="viewport"
								key={item.title}
								className={cn(
									"group relative flex h-8 w-full rounded-[5px] items-center gap-3 px-2 cursor-pointer hover:bg-accent-3 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-accent-7",
									{
										"bg-component border-b hover:bg-component dark:hover:bg-border hover:border-t-gray-7 border border-border":
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
										"relative font-freeman text-sm",

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
				<Box />
				<Box />
			</nav>
			<Box className="relative md:pl-40 bg-gray-2 w-full " minHeight="100vh">
				{children}
			</Box>
		</Flex>
	);
};
export const DashboardSidebarMobile = () => {
	const { pathname } = useLocation();

	const [opened, setOpened] = React.useState(false);
	const splitPath = pathname.split("/");
	const mainPath = splitPath[1];
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
					className={cn("bottom-5 left-4 z-50 absolute md:hidden", {
						hidden: mainPath !== "dashboard",
					})}
				>
					<Icons.Menu size={20} strokeWidth={strokeWidth} />
				</IconButton>
			</DialogTrigger>
			<DialogContent className="w-72 md:hidden left-0 bg-component m-0 rounded-none">
				<nav className={cn("flex flex-col px-1 w-full py-2")}>
					<StoreInfo />
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
										"group relative flex h-12 lg:8 w-full items-center gap-3 px-2 cursor-pointer dark:hover:bg-component hover:bg-accent-3 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-accent-7",
										{
											"bg-component hover:bg-accent-3 dark:hover:bg-accent hover:border-t- gray-7 border border-border":
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
													: "text-gray-11 group-hover:text-accent-11",
											)}
											size={20}
											strokeWidth={strokeWidth}
										/>
									</Flex>
									<span
										className={cn(
											"relative text- gray-11 font-light",

											pathname === item.href
												? "text-accent-11"
												: "text-gray-11 group-hover:text-accent-11",
										)}
									>
										{item.title}
									</span>
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
const StoreInfo = () => {
	return (
		<Box my="2">
			<Select.Root defaultValue="apple">
				<Select.Trigger className="w-full rounded-[5px] h-12 px-2  ">
					<Flex align="center" gap="2">
						<Avatar fallback="F" className="size-9" />
						<Heading size="1">Hello world</Heading>
					</Flex>
				</Select.Trigger>
				<Select.Content className="backdrop-blur-sm z-50">
					<Select.Group>
						<Select.Label>Fruits</Select.Label>
						<Select.Item value="orange">Orange</Select.Item>
						<Select.Item value="apple">Apple</Select.Item>
						<Select.Item value="grape" disabled>
							Grape
						</Select.Item>
					</Select.Group>
					<Select.Separator />
					<Select.Group>
						<Select.Label>Vegetables</Select.Label>
						<Select.Item value="carrot">Carrot</Select.Item>
						<Select.Item value="potato">Potato</Select.Item>
					</Select.Group>
				</Select.Content>
			</Select.Root>
		</Box>
	);
};

export default DashboardSidebar;
