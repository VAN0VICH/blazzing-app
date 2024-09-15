import { Icons } from "@blazzing-app/ui/icons";
import { Avatar, DropdownMenu, IconButton, Spinner } from "@radix-ui/themes";
import { Link } from "@remix-run/react";

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
	const isLoggingOut = false;
	return (
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				<IconButton variant="soft">
					{isLoggingOut ? (
						<Spinner />
					) : (
						<Avatar
							src={undefined}
							width="36px"
							height="36px"
							fallback="K"
							alt="Avatar"
						/>
					)}
				</IconButton>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="center" className="backdrop-blur-sm ">
				{dropdownItems.map((item) => {
					const Icon = Icons[item.icon ?? "chevronLeft"];
					return (
						<Link key={item.href} to={item.href} prefetch="intent">
							<DropdownMenu.Item
								className="h-10 px-2  hover:bg-gray-3 hover:text-accent-11"
								shortcut={item.shortcut}
							>
								<Icon size={16} /> {item.name}
							</DropdownMenu.Item>
						</Link>
					);
				})}
				<DropdownMenu.Separator className="m-1" />
				<DropdownMenu.Item
					className="h-10 hover:bg-red-3 hover:text-red-9"
					color="red"
				>
					<Icons.Logout size={16} />
					Logout
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	);
};
export { ProfileDropdown };
