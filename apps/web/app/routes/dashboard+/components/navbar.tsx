import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@blazzing-app/ui/breadcrumb";
import { Box, Flex, Text } from "@radix-ui/themes";
import { Link, useLocation } from "@remix-run/react";
import { ProfileDropdown } from "~/components/profile-dropdown";
import { DashboardSidebarMobile } from "./sidebar";
import { DashboardSearchCombobox } from "./search";

const DashboardNavbar = () => {
	return (
		<Flex
			position="fixed"
			top="0"
			width="100%"
			height="55px"
			className="border-b z-40 backdrop-blur-lg border-border"
			justify="center"
		>
			<Flex maxWidth="1300px" align="center" px="4" width="100%">
				<Flex align="center" gap="2" className="flex-1">
					<DashboardSidebarMobile />
					<DynamicBreadcrumb />
				</Flex>

				<Box className="flex-1">
					<DashboardSearchCombobox />
				</Box>

				<Flex
					justify={{ initial: "end", sm: "start" }}
					align="center"
					gap="2"
					className="flex-1"
				>
					{true && <ProfileDropdown />}
				</Flex>
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
		<Breadcrumb className="px-2 pl-10 md:pl-2 hidden sm:flex">
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
										className="text-ellipsis max-w-[100px] text-accent-11 text-nowrap overflow-hidden"
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
