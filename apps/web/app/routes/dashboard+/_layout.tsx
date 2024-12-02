import type { LoaderFunction } from "@remix-run/cloudflare";
import { Outlet, redirect } from "@remix-run/react";
import { SidebarLayoutWrapper } from "~/components/layout/sidebar-wrapper";
import { DashboardNavbar } from "./components/navbar";
import DashboardSidebar from "./components/sidebar";
import { getAuth } from "@clerk/remix/ssr.server";
import { hc } from "hono/client";
import type { Routes } from "@blazzing-app/functions";
import { DashboardStoreProvider } from "~/zustand/store";
import { DashboardStoreMutator } from "~/zustand/store-mutator";

export const loader: LoaderFunction = async (args) => {
	// Use getAuth() to retrieve the user's ID
	const { userId } = await getAuth(args);

	// If there is no userId, then redirect to sign-in route
	if (!userId) {
		return redirect("/sign-in");
	}

	if (userId) {
		//@ts-ignore
		const honoClient = hc<Routes>(args.context.cloudflare.env.WORKER_URL);
		const userResponse = await honoClient.user["auth-id"].$get(
			{
				query: {
					authID: userId,
				},
			},
			{
				headers: {
					"x-publishable-key":
						args.context.cloudflare.env.BLAZZING_PUBLISHABLE_KEY,
				},
			},
		);
		if (userResponse.ok) {
			const { result } = await userResponse.json();

			if (!result) {
				console.log("no user found. redirecting to onboarding");
				return redirect("/onboarding");
			}
		}
	}

	// Return the retrieved user data
	return Response.json({});
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
