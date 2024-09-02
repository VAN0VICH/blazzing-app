import { cn } from "@blazzing-app/ui";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@blazzing-app/ui/breadcrumb";
import { Icons, strokeWidth } from "@blazzing-app/ui/icons";
import { Box, Flex, IconButton, Text } from "@radix-ui/themes";
import { Link, useLocation } from "@remix-run/react";
import { ProfileDropdown } from "~/components/profile-dropdown";
import { useDashboardState } from "~/zustand/state";

const DashboardNavbar = () => {
	const location = useLocation();

	const splitPath = location.pathname.split("/");
	const mainPath = splitPath[1];

	const opened = useDashboardState((state) => state.opened);
	const setOpened = useDashboardState((state) => state.setOpened);
	return (
		<Flex
			align="center"
			position="fixed"
			px="4"
			top="0"
			width="100%"
			height="55px"
			className="border-b border-border"
		>
			<Flex align="center" className="flex-1">
				<IconButton
					variant="ghost"
					className={cn("bottom-4 z-50 md:hidden", {
						hidden: mainPath !== "dashboard",
					})}
					onClick={() => setOpened(!opened)}
				>
					<Icons.Menu size={20} strokeWidth={strokeWidth} />
				</IconButton>
				<DynamicBreadcrumb />
			</Flex>

			<Box className="flex-1">{/* <DashboardSearchCombobox /> */}</Box>

			<Flex justify="start" align="center" gap="2" className="flex-1">
				{true && <ProfileDropdown />}
			</Flex>
		</Flex>
	);
};

export function DynamicBreadcrumb() {
	const location = useLocation();
	const pathnames = location.pathname
		.split("/")
		.filter((x) => x)
		.slice(1);

	if (pathnames.length === 0) {
		return null;
	}
	return (
		<Breadcrumb className="px-2 hidden sm:flex">
			<BreadcrumbList>
				{pathnames.map((name, index) => {
					const routeTo = `/dashboard/${pathnames
						.slice(0, index + 1)
						.join("/")}`;
					const isLast = index === pathnames.length - 1;

					return (
						<BreadcrumbItem key={routeTo}>
							{isLast ? (
								<BreadcrumbPage>
									<Text
										size="2"
										className="text-ellipsis max-w-[100px] text-accent-9 text-nowrap overflow-hidden"
									>
										{`${name[0]?.toUpperCase()}${name.substring(1)}`}
									</Text>
								</BreadcrumbPage>
							) : (
								<>
									<Link
										to={routeTo}
										className="focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
									>
										<BreadcrumbLink className="overflow-hidden text-ellipsis w-[100px]">
											<Text
												size="2"
												color="gray"
												className="text-ellipsis max-w-[100px] text-nowrap overflow-hidden"
											>
												{`${name[0]?.toUpperCase()}${name.substring(1)}`}
											</Text>
										</BreadcrumbLink>
									</Link>
									<BreadcrumbSeparator />
								</>
							)}
						</BreadcrumbItem>
					);
				})}
			</BreadcrumbList>
		</Breadcrumb>
	);
}
export { DashboardNavbar };
