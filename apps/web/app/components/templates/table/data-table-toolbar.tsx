import type { Table } from "@tanstack/react-table";

import { cn } from "@blazzing-app/ui";
import type { DebouncedFunc } from "~/types/debounce";
import type { DataTableSearchableColumn, Option } from "~/types/table";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { DataTableViewOptions } from "./data-table-view-options";
import { Box, Flex, TextField } from "@radix-ui/themes";

export interface DataTableFilterableColumn<TData>
	extends DataTableSearchableColumn<TData> {
	options: Option[];
}

interface DataTableToolbarProps<TData> {
	table: Table<TData>;
	filterableColumns?: DataTableFilterableColumn<TData>[] | undefined;
	toolbarButton?: React.ReactNode;
	viewOptions?: boolean;
	onSearch?: DebouncedFunc<(value: string) => void>;
	className?: string;
}

export function DataTableToolbar<TData>({
	filterableColumns,
	table,
	toolbarButton,
	viewOptions = true,
	onSearch,
	className,
}: Readonly<DataTableToolbarProps<TData>>) {
	return (
		<Flex align="center" justify="between" className={cn(className)}>
			<Flex gap="2" pr="2">
				<TextField.Root
					placeholder="Search"
					type="search"
					className="lg:min-w-[300px]"
					variant="classic"
					onChange={(e) => onSearch?.(e.target.value)}
				/>
				<Flex wrap="wrap">
					{filterableColumns?.map(
						(column) =>
							table.getColumn(String(column.id)) && (
								<DataTableFacetedFilter
									key={String(column.id)}
									column={table.getColumn(String(column.id))}
									title={column.title}
									options={column.options}
									table={table}
								/>
							),
					)}
				</Flex>
			</Flex>
			<Flex gap="2">
				<Box className="w-fit">{toolbarButton}</Box>
				{viewOptions && <DataTableViewOptions table={table} />}
			</Flex>
		</Flex>
	);
}
