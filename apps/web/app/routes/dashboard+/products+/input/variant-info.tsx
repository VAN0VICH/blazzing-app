import { Icons } from "@blazzing-app/ui/icons";
import type { Variant } from "@blazzing-app/validators/client";
import { Card, DropdownMenu, Flex, Heading, Text } from "@radix-ui/themes";
import React from "react";

export function VariantInfo({
	variant,
	updateVariant,
}: {
	variant: Variant | undefined;
	updateVariant: () => Promise<void>;
}) {
	const [opened, setOpened] = React.useState(false);

	return (
		<Card className="p-0 w-full">
			<Heading>{variant?.title ?? "Untitled"}</Heading>
			<div className="flex gap-2 mt-0 no-space-y">
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						<Icons.Dots className="h-4 w-4 text- gray-11" />
						<span className="sr-only">Open menu</span>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content
						align="center"
						className="w-[160px] backdrop-blur-sm"
					>
						<DropdownMenu.Item
							className="flex gap-2"
							onClick={() => setOpened(true)}
						>
							<Icons.Edit size={14} /> Edit
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</div>
			<Flex p="$" className="border-b border-border">
				<Text>Description</Text>

				<Text>
					{variant?.description ?? (
						<Icons.Minus className="size-4 text- gray-10" />
					)}
				</Text>
			</Flex>
			<Flex className="border-b border-border">
				<Text>Handle</Text>
				<Text>
					{"/"}
					{variant?.handle ?? <Icons.Minus className="size-4 text- gray-10" />}
				</Text>
			</Flex>
			<Flex p="4">
				<Text>Discountable</Text>

				<Text>{variant?.discountable ? "true" : "false"}</Text>
			</Flex>
		</Card>
	);
}
