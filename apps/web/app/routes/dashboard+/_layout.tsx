import type { LoaderFunction } from "@remix-run/cloudflare";
import { Outlet, redirect } from "@remix-run/react";
import { SidebarLayoutWrapper } from "~/components/layout/sidebar-wrapper";
import { DashboardStoreProvider } from "~/zustand/store";
import { DashboardStoreMutator } from "~/zustand/store-mutator";
import { DashboardNavbar } from "./components/navbar";
import DashboardSidebar from "./components/sidebar";

export const loader: LoaderFunction = async (args) => {
	const { context } = args;
	const { authUser } = context;

	if (!authUser) {
		return redirect("/login");
	}
	if (!authUser.username) {
		return redirect("/onboarding");
	}
	return Response.json(authUser);
};

export default function DashboardLayout() {
	return (
		<DashboardStoreProvider>
			<DashboardStoreMutator>
				<SidebarLayoutWrapper>
					<DashboardSidebar>
						<DashboardNavbar />

						<Outlet />
					</DashboardSidebar>
				</SidebarLayoutWrapper>
			</DashboardStoreMutator>
		</DashboardStoreProvider>
	);
}
