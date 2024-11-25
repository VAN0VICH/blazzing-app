import { flexRender, type ColumnDef, type Row } from "@tanstack/react-table";
import React, { useMemo } from "react";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@blazzing-app/ui/table";
import { useNavigate } from "@remix-run/react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { DataTablePagination } from "~/components/templates/table/data-table-pagination";
import { DataTableToolbar } from "~/components/templates/table/data-table-toolbar";
import { useDataTable } from "~/components/templates/table/use-data-table";
import type { DebouncedFunc } from "~/types/debounce";
import { getCustomersColumns } from "./columns";
import { Box, Flex, Heading, Text } from "@radix-ui/themes";
import type { StoreCustomer } from "@blazzing-app/validators";

interface CustomersTableProps {
	customers: StoreCustomer[];
	onSearch?: DebouncedFunc<(value: string) => void>;
}

function CustomersTable({
	customers,
	onSearch,
}: Readonly<CustomersTableProps>) {
	const columns = useMemo<ColumnDef<StoreCustomer>[]>(
		() => getCustomersColumns(),
		[],
	);
	const table = useDataTable({
		columns,
		data: customers,
	});

	const { rows } = table.getRowModel();
	const navigate = useNavigate();

	const parentRef = React.useRef<HTMLDivElement>(null);

	const virtualizer = useVirtualizer({
		count: rows.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 34,
		overscan: 20,
	});

	return (
		<Box width="100%">
			<DataTableToolbar
				className="p-4 border-b border-border"
				viewOptions={false}
				table={table}
				{...(onSearch && { onSearch })}
			/>

			<Box
				ref={parentRef}
				className="h-[calc(60vh)] lg:h-[calc(68vh)] relative overflow-x-scroll "
			>
				<Box style={{ height: `${virtualizer.getTotalSize()}px` }}>
					<Table>
						<TableHeader className="w-full sticky top-0 bg-component">
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id}>
									{headerGroup.headers.map((header) => {
										return (
											<TableHead key={header.id} colSpan={header.colSpan}>
												{header.isPlaceholder
													? null
													: flexRender(
															header.column.columnDef.header,
															header.getContext(),
														)}
											</TableHead>
										);
									})}
								</TableRow>
							))}
						</TableHeader>
						<TableBody>
							{rows.length ? (
								virtualizer.getVirtualItems().map((virtualRow, index) => {
									const row = rows[virtualRow.index] as Row<StoreCustomer>;
									return (
										<TableRow
											key={row.id}
											data-state={row.getIsSelected() && "selected"}
											onClick={() =>
												navigate(`/dashboard/customers/${row.original.id}`)
											}
											style={{
												height: `${virtualRow.size}px`,
												transform: `translateY(${
													virtualRow.start - index * virtualRow.size
												}px)`,
											}}
										>
											{row.getVisibleCells().map((cell) => (
												<TableCell key={cell.id}>
													{flexRender(
														cell.column.columnDef.cell,
														cell.getContext(),
													)}
												</TableCell>
											))}
										</TableRow>
									);
								})
							) : (
								<TableRow className="border-none hover:bg-transparent">
									<TableCell
										colSpan={columns.length}
										className="h-24 text-center"
									>
										<Flex direction="column" align="center" gap="4">
											<Heading
												size="3"
												className="text-accent-11    tracking-tight"
											>
												You have no customers
											</Heading>
											<Text color="gray">We all start from zero.</Text>
										</Flex>
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</Box>
			</Box>
			<DataTablePagination
				table={table}
				className="p-4 border-t border-border"
			/>
		</Box>
	);
}

export { CustomersTable };
