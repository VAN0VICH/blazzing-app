import { useLocation } from "@remix-run/react";
import { Navbar } from "./navbar";
import { ProfileDropdown } from "../profile-dropdown";
import { Button, Flex } from "@radix-ui/themes";
import { NotificationDropdown } from "../notification-dropdown";
import { Logo } from "../logo";

function Header() {
	const location = useLocation();
	const isRootPage = location.pathname === "/";

	if (isRootPage) return null;

	return (
		<Navbar>
			{/* Left corner */}
			{/* <MobileNavMenu /> */}
			<div />
			<Logo
				to={"/"}
				className="absolute left-20 lg:left-40 xl:left-1/2 flex -translate-x-1/2"
			/>

			{/* Right corner */}
			<Flex gap="3" align="center">
				<NotificationDropdown />
				{/* biome-ignore lint/correctness/noConstantCondition: temporary */}
				{true ? (
					<ProfileDropdown />
				) : (
					<Button variant="classic">Dashboard</Button>
				)}
			</Flex>
		</Navbar>
	);
}

export { Header };
