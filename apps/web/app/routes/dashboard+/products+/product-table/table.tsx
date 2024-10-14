import { PlusIcon } from "@radix-ui/react-icons";
import { flexRender, type ColumnDef, type Row } from "@tanstack/react-table";
import React, { useMemo, type KeyboardEvent } from "react";

import { cn } from "@blazzing-app/ui";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@blazzing-app/ui/table";
import type { Product } from "@blazzing-app/validators/client";
import { useNavigate } from "@remix-run/react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useHotkeys } from "react-hotkeys-hook";
import { DataTableFloatingBar } from "~/components/templates/table/data-table-floating-bar";
import { DataTablePagination } from "~/components/templates/table/data-table-pagination";
import { DataTableToolbar } from "~/components/templates/table/data-table-toolbar";
import { useDataTable } from "~/components/templates/table/use-data-table";
import { filterableColumns, getProductsColumns } from "./columns";
import { Box, Button, Flex, Heading, Separator, Text } from "@radix-ui/themes";
import type { DebouncedFunc } from "~/types/debounce";
interface ProductsTableProps {
	products: Product[];
	createProduct: () => Promise<void>;
	deleteProduct: (keys: string[]) => void;
	copyProduct: (keys: string[]) => void;
	onSearch?: DebouncedFunc<(value: string) => void>;
}

function ProductsTable({
	products,
	createProduct,
	deleteProduct,
	copyProduct,
	onSearch,
}: Readonly<ProductsTableProps>) {
	const columns = useMemo<ColumnDef<Product>[]>(
		() => getProductsColumns({ deleteProduct, copyProduct }),
		[deleteProduct, copyProduct],
	);
	useHotkeys(["D"], () => {
		const rows = table.getFilteredSelectedRowModel().rows;
		console.log("rows", rows);
		deleteProduct(rows.map((r) => r.original.id));
		table.toggleAllPageRowsSelected(false);
	});
	useHotkeys(["C"], () => {
		const rows = table.getFilteredSelectedRowModel().rows;
		copyProduct(rows.map((r) => r.original.id));
		table.toggleAllPageRowsSelected(false);
	});
	const navigate = useNavigate();
	console.log("products", products);
	const table = useDataTable({
		columns,
		data: products,
	});
	const { rows } = table.getRowModel();

	const parentRef = React.useRef<HTMLDivElement>(null);

	const virtualizer = useVirtualizer({
		count: rows.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 34,
		overscan: 20,
	});
	const handleKeyDown = (
		e: KeyboardEvent<HTMLTableRowElement>,
		row: Row<Product>,
	) => {
		if (e.key === "Enter") {
			e.preventDefault();
			navigate(`/dashboard/products/${row.original.id}`);
		}
		if (e.key === " ") {
			console.log("space");
			e.preventDefault();
			e.stopPropagation();
			row.toggleSelected(!row.getIsSelected());
		}
	};

	return (
		<Box width="100%">
			<DataTableToolbar
				className="p-4 border-b border-border"
				table={table}
				filterableColumns={filterableColumns}
				toolbarButton={
					<Button
						size="2"
						variant="classic"
						onClick={createProduct}
						type="button"
					>
						<PlusIcon className="size-4" aria-hidden="true" />
						Add
					</Button>
				}
				{...(onSearch && { onSearch })}
			/>
			<Box
				ref={parentRef}
				className="h-[63vh] lg:h-[66vh] relative overflow-x-scroll"
			>
				<Box style={{ height: `${virtualizer.getTotalSize()}px` }}>
					<Table>
						<TableHeader className="w-full z-20 backdrop-blur-3xl border-b sticky top-0">
							{" "}
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
									const row = rows[virtualRow.index] as Row<Product>;
									return (
										<TableRow
											key={row.id}
											data-state={row.getIsSelected() && "selected"}
											tabIndex={0}
											style={{
												height: `${virtualRow.size}px`,
												transform: `translateY(${
													virtualRow.start - index * virtualRow.size
												}px)`,
											}}
											className={cn(row.getIsSelected() && "bg- gray-2")}
											onClick={() =>
												navigate(`/dashboard/products/${row.original.id}`)
											}
											onKeyDown={(e) => handleKeyDown(e, row)}
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
								<TableRow className="border-none hover:bg-none">
									<TableCell
										colSpan={columns.length}
										className="h-full text-center"
									>
										<Flex
											direction="column"
											align="center"
											gap="4"
											py="6"
											className="text-center"
										>
											<Heading className="   text-accent-11" size="3">
												You have no products
											</Heading>
											<Text color="gray">
												You can start selling as soon as you add a product.
											</Text>
											<Button
												size="2"
												onClick={createProduct}
												type="button"
												variant="classic"
												className="my-2"
											>
												<PlusIcon className="size-4" aria-hidden="true" />
												Add
											</Button>
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
			{table.getFilteredSelectedRowModel().rows.length > 0 && (
				<DataTableFloatingBar
					table={table}
					onDelete={deleteProduct}
					onDuplicate={copyProduct}
				/>
			)}
		</Box>
	);
}

export { ProductsTable };
