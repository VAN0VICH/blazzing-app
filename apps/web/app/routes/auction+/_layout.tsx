import { Box } from "@radix-ui/themes";
import { Outlet } from "@remix-run/react";
import { SidebarLayoutWrapper } from "~/components/layout/sidebar-wrapper";

export default function AuctionLayout() {
	return (
		<SidebarLayoutWrapper>
			<Box pt="55px">
				<Outlet />
			</Box>
		</SidebarLayoutWrapper>
	);
}
