import { Outlet, redirect } from "@remix-run/react";
import { SidebarLayoutWrapper } from "~/components/layout/sidebar-wrapper";
import { DashboardNavbar } from "./components/navbar";
import DashboardSidebar from "./components/sidebar";
import { type LoaderFunction, json } from "@remix-run/cloudflare";
import { DashboardStoreProvider } from "~/zustand/store";
import { DashboardStoreMutator } from "~/zustand/store-mutator";

export const loader: LoaderFunction = async (args) => {
	const { context } = args;
	const { authUser } = context;

	if (!authUser) {
		return redirect("/login");
	}
	if (!authUser.username) {
		return redirect("/onboarding");
	}
	return json(authUser);
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
