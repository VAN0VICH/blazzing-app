import { Icons } from "@blazzing-app/ui/icons";
import { Box, Button, Flex, Tabs } from "@radix-ui/themes";
import { Outlet } from "@remix-run/react";
import React from "react";
import { SidebarLayoutWrapper } from "~/components/layout/sidebar-wrapper";
import { tags } from "~/constants";
import type { AccentColor } from "~/validators/state";
import { useMarketplaceStore } from "~/zustand/store";
import { Products } from "../../components/templates/product/products";

export default function MarketplaceLayout() {
	const [activeTags, setActiveTags] = React.useState<Set<string>>(new Set());

	const products = useMarketplaceStore((state) => state.products);
	const isInitialized = useMarketplaceStore((state) => state.isInitialized);
	return (
		<SidebarLayoutWrapper>
			<div className="absolute -z-10 left-0 right-0 h-[550px] opacity-60 bg-gradient-to-b from-brand-2 to-transparent " />
			<main className="p-2 lg:p-4 mt-16 w-full flex flex-col items-center min-h-screen bg-gray-1">
				<Tabs.Root
					defaultValue="forYou"
					className="flex items-center flex-col w-full"
				>
					<Tabs.List className="gap-10">
						<Tabs.Trigger value="forYou" className="text-lg">
							For you
						</Tabs.Trigger>
						<Tabs.Trigger value="following" className="text-lg">
							Following
						</Tabs.Trigger>
					</Tabs.List>

					<Box width="100%" maxWidth="1700px">
						<Tabs.Content value="forYou">
							<Flex
								justify="between"
								align="center"
								direction={{ initial: "column", sm: "row" }}
								gap="2"
							>
								<Flex gap="3" wrap="wrap" py="6" width="100%">
									{tags.map((tag) => (
										<Button
											key={tag.color}
											color={tag.color as AccentColor}
											variant={activeTags.has(tag.name) ? "solid" : "surface"}
											onClick={() =>
												setActiveTags((prev) => {
													const newSet = new Set(prev);
													if (newSet.has(tag.name)) {
														newSet.delete(tag.name);
													} else {
														newSet.add(tag.name);
													}
													return newSet;
												})
											}
										>
											{tag.name}
										</Button>
									))}
								</Flex>
								<Flex justify="end" width="100%">
									<Button variant="outline">
										<Icons.Filters className="size-4" />
										Filters
									</Button>
								</Flex>
							</Flex>
							<Products
								products={products}
								isInitialized={isInitialized}
								isMarketplace={true}
							/>
						</Tabs.Content>

						<Tabs.Content value="following">
							<Box className="h-[200px] flex justify-center items-center">
								Nothing here...
							</Box>
						</Tabs.Content>
					</Box>
				</Tabs.Root>
			</main>
			<Outlet />
		</SidebarLayoutWrapper>
	);
}
