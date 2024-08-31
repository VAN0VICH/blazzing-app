import { Outlet } from "@remix-run/react";
import { SidebarLayoutWrapper } from "~/components/layout/sidebar-wrapper";
import { DashboardNavbar } from "./components/navbar";
import DashboardSidebar, { DashboardSidebarMobile } from "./components/sidebar";

export default function DashboardLayout() {
	return (
		<SidebarLayoutWrapper>
			<DashboardSidebarMobile />
			<DashboardSidebar>
				<DashboardNavbar />

				<Outlet />
			</DashboardSidebar>
		</SidebarLayoutWrapper>
	);
}
