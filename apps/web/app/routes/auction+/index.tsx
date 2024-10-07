import { Icons } from "@blazzing-app/ui/icons";
import { Box, Button, Flex, Tabs } from "@radix-ui/themes";
import React from "react";
import { tags } from "~/constants";
import type { AccentColor } from "~/validators/state";

export default function Auction() {
	const [activeTags, setActiveTags] = React.useState<Set<string>>(new Set());
	return (
		<Flex direction="column" pt="4">
			<Tabs.Root defaultValue="live" className="flex items-center flex-col">
				<Tabs.List className="gap-10">
					<Tabs.Trigger value="live" className="text-lg">
						Live
					</Tabs.Trigger>
					<Tabs.Trigger value="offline" className="text-lg">
						Offline
					</Tabs.Trigger>
				</Tabs.List>

				<Box width="100%" maxWidth="1700px">
					<Tabs.Content value="live">
						<Flex justify="between" align="center" gap="2">
							<Flex gap="3" wrap="wrap" py="6">
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
													// newSet.add(tag.name);
												}
												return newSet;
											})
										}
									>
										{tag.name}
									</Button>
								))}
							</Flex>
							<Button variant="outline">
								<Icons.Filters className="size-4" />
								Filters
							</Button>
						</Flex>
						{/* <Products isAuction={true} /> */}
					</Tabs.Content>

					<Tabs.Content value="offline">
						<Flex justify="between" align="center">
							<Flex gap="3" wrap="wrap" py="6">
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
							<Button variant="outline">
								<Icons.Filters className="size-4" />
								Filters
							</Button>
						</Flex>
						{/* <Products isAuction={true} /> */}
					</Tabs.Content>
				</Box>
			</Tabs.Root>
		</Flex>
	);
}
