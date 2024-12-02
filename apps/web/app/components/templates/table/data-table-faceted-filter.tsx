import { CheckIcon } from "@radix-ui/react-icons";
import type { Column, Table } from "@tanstack/react-table";
import type * as React from "react";

import { cn } from "@blazzing-app/ui";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "@blazzing-app/ui/command";
import { Icons } from "@blazzing-app/ui/icons";
import {
	Badge,
	Button,
	Flex,
	IconButton,
	Popover,
	Text,
} from "@radix-ui/themes";
import { useUserPreferences } from "~/hooks/use-user-preferences";

interface DataTableFacetedFilterProps<TData, TValue> {
	column: Column<TData, TValue> | undefined;
	title?: string;
	options: {
		label: string;
		value: string;
		icon?: React.ComponentType<{ className?: string }>;
	}[];
	table: Table<TData>;
}

export function DataTableFacetedFilter<TData, TValue>({
	column,
	title,
	options,
	table,
}: DataTableFacetedFilterProps<TData, TValue>) {
	const facets = column?.getFacetedUniqueValues();
	const selectedValues = new Set(column?.getFilterValue() as string[]);
	const isFiltered = table.getState().columnFilters.length > 0;
	const { accentColor } = useUserPreferences();

	return (
		<Popover.Root>
			<Popover.Trigger>
				<Button variant={"outline"}>
					<Flex align="center">
						<Text className="font-body font-normal text-sm h-9 flex items-center">
							{title}
						</Text>
						{selectedValues?.size > 0 && (
							<Flex className="h-9 flex flex-col justify-center px-1">
								<div className="hidden space-x-1 lg:flex">
									{selectedValues.size > 2 ? (
										<Badge color={accentColor ?? "ruby"} size="1">
											{selectedValues.size} selected
										</Badge>
									) : (
										options
											.filter((option) => selectedValues.has(option.value))
											.map((option) => (
												<Badge key={option.value} color={accentColor ?? "ruby"}>
													{option.label}
												</Badge>
											))
									)}
								</div>
							</Flex>
						)}
					</Flex>
					{isFiltered && (
						<IconButton
							variant="ghost"
							onClick={(e) => {
								e.stopPropagation();
								table.resetColumnFilters();
							}}
							size="1"
						>
							<Icons.Close className="min-w-4 max-w-4 min-h-4 max-h-4" />
						</IconButton>
					)}
				</Button>
			</Popover.Trigger>
			<Popover.Content className="w-[200px] p-0" align="start">
				<Command>
					<CommandInput placeholder={title} />
					<CommandList>
						<CommandEmpty>No results found.</CommandEmpty>
						<CommandGroup>
							{options.map((option) => {
								const isSelected = selectedValues.has(option.value);
								return (
									<CommandItem
										key={option.value}
										className="hover:bg-accent-3 hover:text-accent-11 focus:bg-accent-3 group"
										onSelect={() => {
											if (isSelected) {
												selectedValues.delete(option.value);
											} else {
												selectedValues.add(option.value);
											}
											const filterValues = Array.from(selectedValues);
											column?.setFilterValue(
												filterValues.length ? filterValues : undefined,
											);
										}}
									>
										<div
											className={cn(
												"mr-2 flex h-4 w-4 items-center justify-center border group-hover:border-accent-9 border-gray-11 rounded-[3px]",
												isSelected
													? "bg-accent-9 text-accent-11 border-accent-10"
													: "opacity-50 [&_svg]:invisible",
											)}
										>
											<CheckIcon className={cn("h-4 w-4  text-white")} />
										</div>
										{option.icon && <option.icon className="mr-2 h-4 w-4" />}
										<span>{option.label}</span>
										{facets?.get(option.value) && (
											<span className="ml-auto flex h-6 w-6 items-center justify-center font-mono text-lg">
												{facets.get(option.value)}
											</span>
										)}
									</CommandItem>
								);
							})}
						</CommandGroup>
						{selectedValues.size > 0 && (
							<>
								<CommandSeparator />
								<CommandGroup>
									<CommandItem
										onSelect={() => column?.setFilterValue(undefined)}
										className="justify-center text-center rounded-b-[7px]"
									>
										Clear filters
									</CommandItem>
								</CommandGroup>
							</>
						)}
					</CommandList>
				</Command>
			</Popover.Content>
		</Popover.Root>
	);
}
