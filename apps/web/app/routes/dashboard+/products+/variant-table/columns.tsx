import type { ColumnDef } from "@tanstack/react-table";

import type { Product, Variant } from "@blazzing-app/validators/client";
import { Avatar, Box, Checkbox, Flex } from "@radix-ui/themes";
import { DataTableColumnHeader } from "~/components/templates/table/data-table-column-header";
import type { DataTableFilterableColumn } from "~/types/table";
import { RowActions } from "./row-actions";

export function getVariantColumns({
	setVariantID,
	deleteVariant,
}: {
	setVariantID: (id: string | null) => void;
	deleteVariant: (keys: string[]) => Promise<void>;
}): ColumnDef<Variant, unknown>[] {
	return [
		{
			id: "select",
			header: ({ table }) => (
				<Checkbox
					checked={table.getIsAllPageRowsSelected()}
					onChange={(e) => {
						e.stopPropagation();
					}}
					onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
					aria-label="Select all"
					className="translate-y-[2px]"
				/>
			),
			cell: ({ row }) => (
				<Checkbox
					checked={row.getIsSelected()}
					onCheckedChange={(value) => row.toggleSelected(!!value)}
					onClick={(e) => {
						e.stopPropagation();
					}}
					aria-label="Select row"
					className="translate-y-[2px]"
					tabIndex={-1}
				/>
			),
			enableSorting: false,
			enableHiding: false,
		},
		{
			accessorKey: "thumbnail",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Thumbnail" />
			),
			cell: () => (
				<Flex
					justify="center"
					align="center"
					width="50px"
					height="50px"
					className="  "
				>
					<Avatar fallback="3" />
				</Flex>
			),
			enableSorting: false,
			enableHiding: true,
		},
		{
			accessorKey: "title",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Title" />
			),
			cell: (info) => {
				return <Box>{info.getValue() as string}</Box>;
			},
			enableSorting: false,
			enableHiding: false,
		},
		{
			accessorKey: "quantity",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Stock" />
			),
			cell: (info) => {
				return <Box>{info.getValue() as string}</Box>;
			},

			enableSorting: false,
			enableHiding: true,
		},

		{
			id: "actions",
			cell: ({ row }) => (
				<RowActions
					row={row}
					setVariantID={setVariantID}
					deleteVariant={deleteVariant}
				/>
			),
		},
	];
}
export const filterableColumns: DataTableFilterableColumn<Product>[] = [];
