import { Box, Flex } from "@radix-ui/themes";
import { Outlet } from "@remix-run/react";
import { DashboardSettingsSidebar } from "../components/settings-sidebar";

export default function SettingsLayout() {
	return (
		<Flex justify="center" width="100%">
			<Flex maxWidth="1700px" width="100%" gap="4" p="3">
				<Box width="30%" className="hidden lg:block">
					<DashboardSettingsSidebar />
				</Box>
				<Box width={{ initial: "100%", md: "70%" }}>
					<Outlet />
				</Box>
			</Flex>
		</Flex>
	);
}
