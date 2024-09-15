import { useLocation } from "@remix-run/react";
import { Navbar } from "./navbar";
import { ProfileDropdown } from "../profile-dropdown";
import { Button, Flex } from "@radix-ui/themes";
import { NotificationDropdown } from "../notification-dropdown";
import { Logo } from "../logo";
import { SidebarLayoutWrapper } from "./sidebar-wrapper";
import { CartSheet } from "../templates/cart/cart-sheet";
import { cn } from "@blazzing-app/ui";
import { useIsWindowScrolled } from "~/hooks/use-is-window-scrolled";
import { GlobalSearchCombobox } from "../search";
import { useUserPreferences } from "~/hooks/use-user-preferences";

function Header() {
	const location = useLocation();
	const isRootPage = location.pathname === "/";
	const { sidebarState } = useUserPreferences();
	const mode = sidebarState ?? "closed";
	const isScrolled = useIsWindowScrolled();

	if (isRootPage) return null;

	return (
		<Navbar>
			<SidebarLayoutWrapper>
				<Flex justify="between">
					{/* Left corner */}
					{/* <MobileNavMenu /> */}
					<div />
					<Logo
						to={"/"}
						className={cn(
							"absolute left-20 md:left-[51%] flex -translate-x-1/2",
							{
								"md:left-[54%]": mode === "open",
								"md:left-[51%]": isScrolled,
							},
						)}
					/>

					{/* Right corner */}
					<Flex gap="3" align="center">
						<GlobalSearchCombobox />
						<CartSheet cartID={"awd"} />
						<NotificationDropdown />
						{/* biome-ignore lint/correctness/noConstantCondition: temporary */}
						{true ? (
							<ProfileDropdown />
						) : (
							<Button variant="classic">Dashboard</Button>
						)}
					</Flex>
				</Flex>
			</SidebarLayoutWrapper>
		</Navbar>
	);
}

export { Header };
