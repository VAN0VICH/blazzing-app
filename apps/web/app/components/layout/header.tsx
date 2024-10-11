import { cn } from "@blazzing-app/ui";
import { Button, Flex } from "@radix-ui/themes";
import { useLocation } from "@remix-run/react";
import { useIsWindowScrolled } from "~/hooks/use-is-window-scrolled";
import { useRequestInfo } from "~/hooks/use-request-info";
import { useUserPreferences } from "~/hooks/use-user-preferences";
import { Logo } from "../logo";
import { NotificationDropdown } from "../notification-dropdown";
import { ProfileDropdown } from "../profile-dropdown";
import { GlobalSearchCombobox } from "../search";
import { CartSheet } from "../templates/cart/cart-sheet";
import { Navbar } from "./navbar";
import { SidebarLayoutWrapper } from "./sidebar-wrapper";

function Header() {
	const { userContext } = useRequestInfo();
	const { cartID } = userContext;
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
							"absolute left-20 md:left-[52%] flex -translate-x-1/2",
							{
								"md:left-[55%]": mode === "open",
								"md:left-[52%]": isScrolled,
							},
						)}
					/>

					{/* Right corner */}
					<Flex gap="3" align="center">
						<GlobalSearchCombobox />
						<CartSheet cartID={cartID ?? null} />
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
