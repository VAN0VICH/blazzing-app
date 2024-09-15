import { Box } from "@radix-ui/themes";
import { Outlet } from "@remix-run/react";
import { SidebarLayoutWrapper } from "~/components/layout/sidebar-wrapper";

export default function Layout() {
	return (
		<SidebarLayoutWrapper>
			<Box p="20px" pt="85px">
				<Outlet />
			</Box>
		</SidebarLayoutWrapper>
	);
}
