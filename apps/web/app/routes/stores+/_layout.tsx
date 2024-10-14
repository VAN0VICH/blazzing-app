import { Box, Flex } from "@radix-ui/themes";
import { Outlet } from "@remix-run/react";
import { SidebarLayoutWrapper } from "~/components/layout/sidebar-wrapper";

export default function Layout() {
	return (
		<SidebarLayoutWrapper>
			<Flex justify="center" width="100%" className="bg-gray-1">
				<Box pt="63px" maxWidth="1700px" width="100%">
					<Box p="3" className="pb-20 lg:pb-3">
						<Outlet />
					</Box>
				</Box>
			</Flex>
		</SidebarLayoutWrapper>
	);
}
