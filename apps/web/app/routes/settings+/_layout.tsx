// import { getAuth } from "@clerk/remix/ssr.server";
import { Box, Flex, Heading } from "@radix-ui/themes";
import { Outlet, useLocation } from "@remix-run/react";
import { SidebarLayoutWrapper } from "~/components/layout/sidebar-wrapper";
import { capitalize } from "~/utils/helpers";
import { SettingsSidebar } from "./sidebar";

export default function SettingsLayout() {
	const location = useLocation();
	const pathname = location.pathname;
	const lastPathnamePart = pathname.split("/").filter(Boolean).pop();
	return (
		<SidebarLayoutWrapper>
			<SettingsSidebar>
				<Box
					className="md:pl-40 bg-background"
					width="100%"
					pt="55px"
					position="relative"
				>
					<Flex
						top="0"
						position="fixed"
						width="100%"
						align="center"
						justify="center"
						className="bg-component backdrop-blur-sm border-b z-50"
						height="55px"
					>
						<Heading
							size="6"
							className={"md:pr-60 py-4 font-freeman text-accent-9"}
						>
							{capitalize(lastPathnamePart)}
						</Heading>
					</Flex>
					<Outlet />
				</Box>
			</SettingsSidebar>
		</SidebarLayoutWrapper>
	);
}
