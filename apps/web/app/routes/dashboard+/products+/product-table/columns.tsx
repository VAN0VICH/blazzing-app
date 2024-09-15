import type { ColumnDef } from "@tanstack/react-table";

import { productStatuses } from "@blazzing-app/validators";
import type { Product } from "@blazzing-app/validators/client";
import { Avatar, Box, Checkbox, Flex, Heading } from "@radix-ui/themes";
import { ProductStatus } from "~/components/badge/product-status";
import { DataTableColumnHeader } from "~/components/templates/table/data-table-column-header";
import type { DataTableFilterableColumn } from "~/types/table";
import { RowActions } from "./row-actions";

export function getProductsColumns({
	deleteProduct,
	copyProduct,
}: {
	deleteProduct: (keys: string[]) => void;
	copyProduct: (keys: string[]) => void;
}): ColumnDef<Product, unknown>[] {
	return [
		{
			id: "select",
			header: ({ table }) => (
				<Checkbox
					checked={table.getIsAllPageRowsSelected()}
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
			cell: () => {
				return (
					<Flex
						justify="center"
						align="center"
						width="50px"
						height="50px"
						className="  "
					>
						<Avatar fallback="3" />
					</Flex>
				);
			},

			enableSorting: false,
			enableHiding: true,
		},
		{
			accessorKey: "title",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Title" />
			),
			cell: () => {
				return (
					<Box>
						<Heading className="  ">{"Untitled"}</Heading>
					</Box>
				);
			},
			enableSorting: false,
			enableHiding: false,
		},
		{
			accessorKey: "collection",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Collection" />
			),
			cell: ({ row }) => (
				<Box className="w-[80px]">{row.original.collection?.handle}</Box>
			),
			enableSorting: false,
			enableHiding: true,
		},
		{
			accessorKey: "status",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Status" />
			),
			cell: ({ row }) => {
				const status = row.original.status;

				if (!status) {
					return null;
				}

				return (
					<Flex align="center" width="100px">
						<ProductStatus status={status} />
					</Flex>
				);
			},
			filterFn: (row, id, value) => {
				return Array.isArray(value) && value.includes(row.getValue(id));
			},
			enableSorting: false,
			enableHiding: false,
		},
		{
			accessorKey: "quantity",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Quantity" />
			),
			cell: ({ row }) => {
				return (
					<Box className="w-[80px]">
						<Heading className="lg:text-md">
							{row.original.baseVariant.quantity}
						</Heading>
					</Box>
				);
			},

			enableSorting: false,
			enableHiding: true,
		},
		{
			id: "actions",
			cell: ({ row }) => (
				<RowActions
					row={row}
					deleteProduct={deleteProduct}
					copyProduct={copyProduct}
				/>
			),
		},
	];
}
export const filterableColumns: DataTableFilterableColumn<Product>[] = [
	{
		id: "status",
		title: "Status",
		options: productStatuses.map((status) => ({
			label: status[0]?.toUpperCase() + status.slice(1),
			value: status,
		})),
	},
];