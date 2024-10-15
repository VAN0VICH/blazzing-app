import { Icons } from "@blazzing-app/ui/icons";
import { Avatar, DropdownMenu, Spinner } from "@radix-ui/themes";
import { Link, useFetcher } from "@remix-run/react";
import React from "react";
import type { action } from "~/routes/action+/logout";

type DropdownItem = {
	name: string;
	icon: keyof typeof Icons;
	href: string;
	shortcut: string;
};
const dropdownItems: DropdownItem[] = [
	{
		name: "Dashboard",
		icon: "Dashboard",
		href: "/dashboard",
		shortcut: "⌘ D",
	},
	{
		name: "Orders",
		icon: "Order",
		href: "/orders",
		shortcut: "⌘ O",
	},
	{
		name: "Settings",
		icon: "Settings",
		href: "/settings",
		shortcut: "⌘ S",
	},
];
const ProfileDropdown = () => {
	const fetcher = useFetcher<typeof action>();
	const logout = React.useCallback(() => {
		return fetcher.submit(
			{},
			{
				method: "POST",
				action: "/action/logout",
			},
		);
	}, [fetcher]);
	const isLoggingOut = fetcher.state === "submitting";
	return (
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				<button
					type="button"
					className="bg-component dark:bg-gray-3 dark:shadow-accent-2  flex justify-center items-center size-[45px] shadow-sm text-accent-11 hover:bg-accent-2 hover:border-accent-6 border-accent-4 border rounded-[7px] focus-visible:ring-accent-8 focus-visible:outline-none focus-visible:ring-2"
				>
					{isLoggingOut ? (
						<Spinner />
					) : (
						<Avatar
							src={undefined}
							fallback={<Icons.User className="size-5" strokeWidth="1.5px" />}
							alt="Avatar"
							className="size-[43px] bg-transparent"
						/>
					)}
				</button>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="center" className="backdrop-blur-sm ">
				{dropdownItems.map((item) => {
					const Icon = Icons[item.icon ?? "chevronLeft"];
					return (
						<Link key={item.href} to={item.href} prefetch="intent">
							<DropdownMenu.Item
								className="h-10 px-2 rounded-[5px] hover:bg-accent-3  hover:text-accent-11"
								shortcut={item.shortcut}
							>
								<Icon size={16} /> {item.name}
							</DropdownMenu.Item>
						</Link>
					);
				})}
				<DropdownMenu.Separator className="m-1" />
				<DropdownMenu.Item
					className="h-10 rounded-[5px] hover:bg-red-3 hover:text-red-9"
					color="red"
					onClick={logout}
				>
					<Icons.Logout size={16} />
					Logout
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	);
};
export { ProfileDropdown };
