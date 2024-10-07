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
			position="sticky"
			top="0"
			width="100%"
			px="3"
			height="64px"
			className="border-b z-40 backdrop-blur-lg border-border"
			justify="center"
		>
			<Flex maxWidth="1700px" align="center" width="100%">
				<Flex align="center" gap="2" className="flex-1">
					<DashboardSidebarMobile />
					<DynamicBreadcrumb />
				</Flex>

				<Flex className="flex-1" justify="center">
					<DashboardSearchCombobox />
				</Flex>

				<Flex justify="end" align="center" gap="2" className="flex-1">
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
		<Breadcrumb className="hidden sm:flex">
			<BreadcrumbList>
				{pathnames.map((name, index) => {
					const routeTo = `/dashboard/${pathnames
						.slice(0, index + 1)
						.join("/")}`;
					const isLast = index === pathnames.length - 1;

					return (
						<BreadcrumbItem key={routeTo}>
							{isLast ? (
								<BreadcrumbPage className="w-[100px] overflow-hidden text-ellipsis">
									<Text size="2" className="text-accent-11 text-nowrap">
										{`${name[0]?.toUpperCase()}${name.substring(1)}`}
									</Text>
								</BreadcrumbPage>
							) : (
								<>
									<Link
										to={routeTo}
										className="focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
									>
										<BreadcrumbLink className="overflow-hidden max-w-[100px] text-ellipsis w-[100px]">
											<Text size="2" color="gray" className="text-nowrap ">
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
