import { DownloadIcon } from "@radix-ui/react-icons";
import type { Table } from "@tanstack/react-table";
import * as React from "react";

import { Icons } from "@blazzing-app/ui/icons";
import { toast } from "@blazzing-app/ui/toast";
import { Box, Button, Card, Flex, Kbd, Tooltip } from "@radix-ui/themes";

interface DataTableFloatingBarProps<TData extends { id: string }> {
	table: Table<TData>;
	onDelete?: (keys: string[]) => void;
	onDuplicate?: (keys: string[]) => void;
}

export function DataTableFloatingBar<TData extends { id: string }>({
	table,
	onDelete,
	onDuplicate,
}: DataTableFloatingBarProps<TData>) {
	// Clear selection on Escape key press
	React.useEffect(() => {
		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") {
				table.toggleAllRowsSelected(false);
			}
		}

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [table]);

	return (
		<Flex className="fixed left-1/2 -translate-x-1/2 bottom-20 lg:bottom-10 rounded-lg z-30 w-fit px-4">
			<Box className="w-full overflow-x-auto">
				<Card className="mx-auto flex w-fit items-center gap-2 p-2 shadow-2xl">
					{onDuplicate && (
						<Tooltip content="Copy" delayDuration={250}>
							<Button
								variant="ghost"
								className="flex gap-3"
								onClick={() => {
									const rows = table.getFilteredSelectedRowModel().rows;
									if (rows.length > 20)
										return toast.error(
											"You can only duplicate 20 products at a time.",
										);
									onDuplicate(rows.map((row) => row.original.id));
									table.toggleAllRowsSelected(false);
								}}
							>
								<Icons.Copy aria-hidden="true" size={15} />
								<Kbd>C</Kbd>
							</Button>
						</Tooltip>
					)}
					<Tooltip content="Export" delayDuration={250}>
						<Button variant="ghost" className="flex gap-3">
							<DownloadIcon aria-hidden="true" fontSize={15} />
							<Kbd>E</Kbd>
						</Button>
					</Tooltip>
					{onDelete && (
						<Tooltip content="Delete" delayDuration={250}>
							<Button
								variant="ghost"
								className="flex gap-3"
								onClick={() => {
									const rows = table.getFilteredSelectedRowModel().rows;
									onDelete(rows.map((row) => row.original.id));
									table.toggleAllRowsSelected(false);
								}}
							>
								<Icons.Trash
									size={15}
									aria-hidden="true"
									className="text-red-9"
								/>
								<Kbd>D</Kbd>
							</Button>
						</Tooltip>
					)}
				</Card>
			</Box>
		</Flex>
	);
}
