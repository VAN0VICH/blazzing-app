// import { getAuth } from "@clerk/remix/ssr.server";
import { Box, Flex, Heading } from "@radix-ui/themes";
import { Outlet, useLocation } from "@remix-run/react";
import { SidebarLayoutWrapper } from "~/components/layout/sidebar-wrapper";
import { capitalize } from "~/utils/helpers";
import { SettingsSidebar, SettingsSidebarMobile } from "./sidebar";

export default function SettingsLayout() {
	const location = useLocation();
	const pathname = location.pathname;
	const lastPathnamePart = pathname.split("/").filter(Boolean).pop();
	return (
		<SidebarLayoutWrapper>
			<SettingsSidebar>
				<Box
					className="md:pl-40 bg-gray-3"
					width="100%"
					pt="55px"
					position="relative"
				>
					<SettingsSidebarMobile />
					<Flex
						top="0"
						position="fixed"
						width="100%"
						px="4"
						justify="center"
						align="center"
						className="bg-component backdrop-blur-sm border-b z-40"
						height="55px"
					>
						<Heading size="6" className={"md:pr-60 py-4   text-accent-11"}>
							{capitalize(lastPathnamePart)}
						</Heading>
					</Flex>
					<Outlet />
				</Box>
			</SettingsSidebar>
		</SidebarLayoutWrapper>
	);
}
