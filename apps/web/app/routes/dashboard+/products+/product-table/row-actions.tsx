import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import type { Row } from "@tanstack/react-table";

import { Icons } from "@blazzing-app/ui/icons";
import type { Product } from "@blazzing-app/validators/client";
import { DropdownMenu } from "@radix-ui/themes";
import { useNavigate } from "@remix-run/react";

interface DataTableRowActionsProps {
	row: Row<Product>;
	deleteProduct: (keys: string[]) => void;
	copyProduct: (keys: string[]) => void;
}

export function RowActions({
	row,
	deleteProduct,
	copyProduct,
}: DataTableRowActionsProps) {
	const navigate = useNavigate();

	return (
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				<DotsHorizontalIcon className="h-4 w-4 text- gray-11" />
				<span className="sr-only">Open menu</span>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content
				align="center"
				className="w-[160px] backdrop-blur-sm"
			>
				<DropdownMenu.Item
					className="flex gap-2"
					onClick={async (e) => {
						e.stopPropagation();

						navigate(`/dashboard/products/${row.original.id}`);
					}}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							e.preventDefault();
							e.stopPropagation();
							navigate(`/dashboard/products/${row.original.id}`);
						}
					}}
				>
					<Icons.Edit size={14} /> Edit
				</DropdownMenu.Item>
				<DropdownMenu.Item
					className="flex gap-2"
					onClick={(e) => {
						e.stopPropagation();
						copyProduct([row.original.id]);
					}}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							e.preventDefault();
							e.stopPropagation();
							copyProduct([row.original.id]);
						}
					}}
				>
					<Icons.Copy size={14} />
					Copy
				</DropdownMenu.Item>
				<DropdownMenu.Separator />
				<DropdownMenu.Item
					className="flex gap-2 "
					onClick={async (e) => {
						e.stopPropagation();
						deleteProduct([row.original.id]);
					}}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							e.preventDefault();
							e.stopPropagation();
							deleteProduct([row.original.id]);
						}
					}}
				>
					<Icons.Trash size={14} />
					Delete
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	);
}
