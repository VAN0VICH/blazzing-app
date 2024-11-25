import type { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "~/components/templates/table/data-table-column-header";
import type { DataTableFilterableColumn } from "~/types/table";
import { orderStatuses, type StoreOrder } from "@blazzing-app/validators";
import { Avatar, Box, Flex, Text } from "@radix-ui/themes";
import { OrderStatus } from "~/components/badge/order-status";
import ImagePlaceholder from "~/components/image-placeholder";
import { formatISODate } from "~/utils/format";

export function getOrdersColumns(): ColumnDef<StoreOrder, unknown>[] {
	return [
		{
			accessorKey: "customer",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Customer" />
			),
			cell: ({ row }) => (
				<Flex gap="2" width="200px">
					<Avatar
						fallback={<ImagePlaceholder />}
						className="border border-accent-5"
						src={
							typeof row.original?.customer?.user?.avatar === "string"
								? row.original?.customer?.user.avatar
								: row.original?.customer?.user?.avatar?.url
						}
					/>
					<Box>
						<Text size="2">{row.original.fullName}</Text>
						<Text size="2">{row.original.email}</Text>
					</Box>
				</Flex>
			),
			enableSorting: false,
			enableHiding: false,
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
					<Flex width="100px" align="center">
						<OrderStatus status={status} />
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
			accessorKey: "Date",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Date" />
			),
			cell: ({ row }) => {
				return (
					<div className="w-[80px]">
						{formatISODate(row.original.createdAt)}
					</div>
				);
			},

			enableSorting: false,
			enableHiding: false,
		},
		{
			accessorKey: "Total",
			header: ({ column }) => (
				<DataTableColumnHeader
					column={column}
					className="w-full flex justify-center"
					title="Total"
				/>
			),
			cell: ({ row }) => {
				return (
					<div className="w-full flex justify-center">{`${row.original.currencyCode} ${row.original.total}`}</div>
				);
			},

			enableSorting: false,
			enableHiding: false,
		},
	];
}
export const filterableColumns: DataTableFilterableColumn<StoreOrder>[] = [
	{
		id: "status",
		title: "Status",
		options: orderStatuses.map((status) => ({
			label: status[0]?.toUpperCase() + status.slice(1),
			value: status,
		})),
	},
];
