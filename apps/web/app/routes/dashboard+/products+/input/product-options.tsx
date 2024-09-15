import React from "react";

import {
	DialogContent,
	DialogRoot,
	DialogTitle,
} from "@blazzing-app/ui/dialog-vaul";
import { Icons } from "@blazzing-app/ui/icons";
import { TagInput } from "@blazzing-app/ui/tag-input";
import type { ProductOption } from "@blazzing-app/validators/client";
import {
	Badge,
	Button,
	Card,
	DropdownMenu,
	Flex,
	Grid,
	Heading,
	IconButton,
	ScrollArea,
	Text,
	TextField,
} from "@radix-ui/themes";
import { useUserPreferences } from "~/hooks/use-user-preferences";

interface CreateOptionProps {
	productID: string;
	options: ProductOption[];
}
export function ProductOptions({ productID, options }: CreateOptionProps) {
	const [opened, setOpened] = React.useState(false);
	const [editOpened, setEditOpened] = React.useState(false);
	const [optionName, setOptionName] = React.useState<string>();
	const [values, setValues] = React.useState<string[]>([]);
	const [selectedOption, setSelectedOption] = React.useState<ProductOption>();
	const [selectedOptionName, setSelectedOptionName] = React.useState<string>();
	const [selectedValues, setSelectedValues] = React.useState<string[]>([]);
	const [dropdownOpened, setDropdownOpened] = React.useState(false);
	const { accentColor } = useUserPreferences();
	return (
		<>
			<Card className="p-0">
				<Flex
					justify="between"
					align="center"
					className="border-b border-border"
					p="4"
				>
					<Heading size="3" className="text-accent-11">
						Options{" "}
						<span className="text-accent-8 text-xs">{"(Optional)"}</span>
					</Heading>
					<Flex gap="2" align="start">
						<IconButton size="3" variant="ghost">
							<Icons.Edit className="size-4" />
						</IconButton>
					</Flex>
				</Flex>
				<Grid className="border-border">
					{options.length === 0 && (
						<Flex width="100%" height="100px" justify="center" align="center">
							<Text color="gray" size="2">
								Create options to add variants for this product.
							</Text>
						</Flex>
					)}
					{options.map((option) => {
						return (
							<Flex
								key={option.id}
								p="4"
								className="border-b last:border-b-0 border-border"
							>
								<Text>1,</Text>
								<Flex align="center" justify="center">
									<Flex wrap="wrap" gap="1">
										{(option.optionValues ?? []).map((value) => (
											<Badge key={value.id} color={accentColor ?? "ruby"}>
												{value.value}
											</Badge>
										))}
									</Flex>
									<DropdownMenu.Root>
										<DropdownMenu.Trigger>
											<Icons.Dots className="size-4" />
											<span className="sr-only">Open menu</span>
										</DropdownMenu.Trigger>
										<DropdownMenu.Content
											align="center"
											className="w-[160px] backdrop-blur-sm"
										>
											<DropdownMenu.Item
												className="flex gap-2"
												onClick={() => {
													setEditOpened(true);
													setSelectedOption(option);
													setSelectedOptionName(option?.name ?? undefined);
													setSelectedValues(
														option?.optionValues?.map((v) => v.value) ?? [],
													);
												}}
											>
												<Icons.Edit size={14} /> Edit
											</DropdownMenu.Item>
											<DropdownMenu.Item className="flex gap-2">
												<Icons.Trash size={14} /> Delete
											</DropdownMenu.Item>
										</DropdownMenu.Content>
									</DropdownMenu.Root>
								</Flex>
							</Flex>
						);
					})}
				</Grid>
			</Card>
			<DialogRoot direction="right" open={opened} onOpenChange={setOpened}>
				<DialogContent className="sm:w-[500px]">
					<DialogTitle className="p-4 border-b border-border font-bold text-xl">
						Create option
					</DialogTitle>
					<ScrollArea className="p-4 h-[78vh] pt-0">
						<Grid gap="4">
							<Grid gap="2">
								<label className="pl-[1px]">Name</label>
								<TextField.Root
									className="bg- gray-1"
									placeholder="Color"
									onChange={(e) => setOptionName(e.target.value)}
								/>
							</Grid>

							<Grid className="gap-2">
								<label className="pl-[1px]">Values</label>
								<TagInput value={values} onChange={setValues} />
							</Grid>
						</Grid>
					</ScrollArea>
					<div className="p-4 flex justify-end w-full border-t border-border absolute bottom-0">
						<div className="flex gap-2">
							<Button
								variant="outline"
								onClick={() => {
									setOpened(false);
								}}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										e.preventDefault();
										e.stopPropagation();
										setOpened(false);
									}
								}}
							>
								Cancel
							</Button>
							<Button
								onKeyDown={async (e) => {
									if (e.key === "Enter" || e.key === " ") {
										e.preventDefault();
										e.stopPropagation();
									}
								}}
							>
								Save
							</Button>
						</div>
					</div>
				</DialogContent>
			</DialogRoot>
		</>
	);
}
