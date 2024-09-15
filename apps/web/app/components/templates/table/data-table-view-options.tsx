import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { MixerHorizontalIcon } from "@radix-ui/react-icons";
import { DropdownMenu, IconButton } from "@radix-ui/themes";
import type { Table } from "@tanstack/react-table";

interface DataTableViewOptionsProps<TData> {
	table: Table<TData>;
}

export function DataTableViewOptions<TData>({
	table,
}: DataTableViewOptionsProps<TData>) {
	return (
		<DropdownMenu.Root>
			<DropdownMenuTrigger asChild>
				<IconButton variant="outline" type="button">
					<MixerHorizontalIcon className="size-4" />
				</IconButton>
			</DropdownMenuTrigger>
			<DropdownMenu.Content align="end" className="w-[150px] backdrop-blur-sm">
				<DropdownMenu.Label>Toggle columns</DropdownMenu.Label>
				<DropdownMenu.Separator />
				{table
					.getAllColumns()
					.filter(
						(column) =>
							typeof column.accessorFn !== "undefined" && column.getCanHide(),
					)
					.map((column) => {
						return (
							<DropdownMenu.CheckboxItem
								key={column.id}
								className="capitalize"
								checked={column.getIsVisible()}
								onCheckedChange={(value) => column.toggleVisibility(!!value)}
							>
								{column.id}
							</DropdownMenu.CheckboxItem>
						);
					})}
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	);
}
