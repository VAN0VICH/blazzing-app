import { Box } from "@radix-ui/themes";
import { Outlet } from "@remix-run/react";
import { SidebarLayoutWrapper } from "~/components/layout/sidebar-wrapper";

export default function AuctionLayout() {
	return (
		<SidebarLayoutWrapper>
			<Box pt="63px" p="2" className="px-2 lg:px-4 bg-gray-1 min-h-screen">
				<Outlet />
			</Box>
		</SidebarLayoutWrapper>
	);
}
