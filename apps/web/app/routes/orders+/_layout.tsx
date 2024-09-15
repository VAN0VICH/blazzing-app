import { Box } from "@radix-ui/themes";
import { Outlet } from "@remix-run/react";
import { SidebarLayoutWrapper } from "~/components/layout/sidebar-wrapper";

export default function OrdersLayout() {
	return (
		<SidebarLayoutWrapper>
			<Box pt="55px" className="bg-gray-3 min-h-screen">
				<Outlet />
			</Box>
		</SidebarLayoutWrapper>
	);
}
