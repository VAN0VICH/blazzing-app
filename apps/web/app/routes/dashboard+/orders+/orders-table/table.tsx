import { flexRender, type ColumnDef, type Row } from "@tanstack/react-table";
import React, { useMemo } from "react";

import { Ping } from "@blazzing-app/ui/ping";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@blazzing-app/ui/table";
import type { Order } from "@blazzing-app/validators/client";
import { useVirtualizer } from "@tanstack/react-virtual";
import { DataTablePagination } from "~/components/templates/table/data-table-pagination";
import { DataTableToolbar } from "~/components/templates/table/data-table-toolbar";
import { useDataTable } from "~/components/templates/table/use-data-table";
import type { DebouncedFunc } from "~/types/debounce";
import { filterableColumns, getOrdersColumns } from "./columns";
import { useNavigate } from "@remix-run/react";
import { Flex, Heading, Separator, Text } from "@radix-ui/themes";

interface OrdersTableProps {
	orders: Order[];
	setOrderID?: (id: string | undefined) => void;
	orderID?: string | undefined;
	toolbar?: boolean;
	withNavigation?: boolean;
	onSearch?: DebouncedFunc<(value: string) => void>;
}

function OrdersTable({
	orders,
	setOrderID,
	orderID,
	toolbar = true,
	withNavigation = false,
	onSearch,
}: Readonly<OrdersTableProps>) {
	const columns = useMemo<ColumnDef<Order>[]>(() => getOrdersColumns(), []);
	const table = useDataTable({
		columns,
		data: orders,
	});

	const { rows } = table.getRowModel();

	const parentRef = React.useRef<HTMLDivElement>(null);

	const virtualizer = useVirtualizer({
		count: rows.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 34,
		overscan: 20,
	});
	const navigate = useNavigate();

	return (
		<div className="max-w-7xl w-full">
			{toolbar && (
				<DataTableToolbar
					className="px-4 pt-4"
					viewOptions={false}
					table={table}
					filterableColumns={filterableColumns}
					{...(onSearch && { onSearch })}
				/>
			)}
			{/* {dashboardRep?.online && ( */}
			<div className="w-full px-4 py-2 border-b border-border flex items-center gap-2">
				<Ping />
				<p className="text-accent-11 text-sm font-bold">Real time</p>
			</div>
			{/* )} */}

			<div
				ref={parentRef}
				className="h-[calc(60vh)] lg:h-[calc(68vh)] relative overflow-x-scroll "
			>
				<div style={{ height: `${virtualizer.getTotalSize()}px` }}>
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

							<Separator className="absolute top-10 bg-border" />
						</TableHeader>
						<TableBody>
							{rows.length ? (
								virtualizer.getVirtualItems().map((virtualRow, index) => {
									const row = rows[virtualRow.index] as Row<Order>;
									return (
										<TableRow
											key={row.id}
											data-state={row.original.id === orderID && "selected"}
											onClick={() => {
												withNavigation
													? navigate(`/dashboard/orders/${row.original.id}`)
													: setOrderID?.(row.original.id);
											}}
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
								<TableRow className="border-none h-full hover:bg-transparent">
									<TableCell
										colSpan={columns.length}
										className="h-24 text-center"
									>
										<Flex align="center" py="4" direction="column" gap="4">
											<Heading
												size="3"
												className="   text-accent-11 tracking-tight"
											>
												You have no orders
											</Heading>
											<Text color="gray">But they may come any time soon</Text>
										</Flex>
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
			</div>
			<DataTablePagination
				table={table}
				className="p-4 border-t border-border"
			/>
		</div>
	);
}

export { OrdersTable };
