import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@blazzing-app/ui/table";
import type { Variant } from "@blazzing-app/validators/client";
import { flexRender, type ColumnDef, type Row } from "@tanstack/react-table";
import React, { useMemo, type KeyboardEvent } from "react";
import { useDataTable } from "~/components/templates/table/use-data-table";
import { getVariantColumns } from "./columns";
import { useVirtualizer } from "@tanstack/react-virtual";
import { DataTableToolbar } from "~/components/templates/table/data-table-toolbar";
import type { DebouncedFunc } from "~/types/debounce";
import { DataTablePagination } from "~/components/templates/table/data-table-pagination";
import { DataTableFloatingBar } from "~/components/templates/table/data-table-floating-bar";
import { cn } from "@blazzing-app/ui";
import { useHotkeys } from "react-hotkeys-hook";
import { Box, Button, Separator, Text } from "@radix-ui/themes";

interface VariantTableProps {
	variants: Variant[];
	setVariantID: (variant: string | null) => void;
	generateVariants: () => void;
	deleteVariant: (keys: string[]) => Promise<void>;
	onSearch?: DebouncedFunc<(value: string) => void>;
}
export default function VariantTable({
	variants,
	setVariantID,
	generateVariants,
	deleteVariant,
	onSearch,
}: VariantTableProps) {
	const columns = useMemo<ColumnDef<Variant>[]>(
		() =>
			getVariantColumns({
				setVariantID,
				deleteVariant,
			}),
		[setVariantID, deleteVariant],
	);
	const table = useDataTable({
		columns,
		data: variants,
		pageSize: 10,
	});
	const { rows } = table.getRowModel();
	const parentRef = React.useRef<HTMLDivElement>(null);
	useHotkeys(["D"], () => {
		const rows = table.getFilteredSelectedRowModel().rows;
		console.log("rows", rows);
		deleteVariant(rows.map((r) => r.original.id));
		table.toggleAllPageRowsSelected(false);
	});
	const virtualizer = useVirtualizer({
		count: rows.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 34,
		overscan: 20,
	});
	const handleKeyDown = (
		e: KeyboardEvent<HTMLTableRowElement>,
		row: Row<Variant>,
	) => {
		if (e.key === "Enter") {
			e.preventDefault();
			setVariantID(row.original.id);
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
				toolbarButton={
					<Button
						size="2"
						onClick={generateVariants}
						variant="outline"
						type="button"
					>
						Generate
					</Button>
				}
				{...(onSearch && { onSearch })}
			/>
			<Box
				ref={parentRef}
				className="min-h-[calc(20vh)] max-h-[calc-(50vh)] relative overflow-x-scroll"
			>
				<Box style={{ height: `${virtualizer.getTotalSize()}px` }}>
					<Table>
						<TableHeader className="w-full z-20 sticky hover:border-x border-border top-0">
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
							{table.getRowModel().rows.length > 0 ? (
								virtualizer.getVirtualItems().map((virtualRow, index) => {
									const row = rows[virtualRow.index] as Row<Variant>;
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
											className={cn(row.getIsSelected() && "bg-gray-2")}
											onClick={(e) => {
												e.preventDefault();
												e.stopPropagation();
												setVariantID(row.original.id);
											}}
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
								<TableRow className="border-none hover:bg-transparent">
									<TableCell
										colSpan={columns.length}
										className="h-24 text-center text- gray-9"
									>
										<Text size="2" color="gray">
											No variants.
										</Text>
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
				pageSizes={[10, 20, 30]}
			/>
			{table.getFilteredSelectedRowModel().rows.length > 0 && (
				<DataTableFloatingBar table={table} onDelete={deleteVariant} />
			)}
		</Box>
	);
}
