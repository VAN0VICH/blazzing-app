import type { ColumnDef } from "@tanstack/react-table";

import type { Customer } from "@blazzing-app/validators/client";
import { Avatar, Flex, Grid, Text } from "@radix-ui/themes";
import { DataTableColumnHeader } from "~/components/templates/table/data-table-column-header";
import ImagePlaceholder from "~/components/image-placeholder";

export function getCustomersColumns(): ColumnDef<Customer, unknown>[] {
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
						src={
							typeof row.original?.user?.avatar === "string"
								? row.original?.user.avatar
								: row.original?.user?.avatar?.url
						}
					/>
					<Grid gap="1">
						<Text size="1">
							{row.original.user?.username ?? row.original.user?.fullName}
						</Text>
						<Text size="1">{row.original.email}</Text>
					</Grid>
				</Flex>
			),
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
			cell: () => {
				return <Flex justify="center">{69}</Flex>;
			},

			enableSorting: false,
			enableHiding: false,
		},
	];
}
