import { Icons } from "@blazzing-app/ui/icons";
import type { Variant } from "@blazzing-app/validators/client";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { DropdownMenu } from "@radix-ui/themes";
import type { Row } from "@tanstack/react-table";

interface DataTableRowActionsProps<TData> {
	row: Row<TData>;

	setVariantID: (id: string | null) => void;
	deleteVariant: (keys: string[]) => Promise<void>;
}

export function RowActions({
	row,
	setVariantID,
	deleteVariant,
}: DataTableRowActionsProps<Variant>) {
	// const task = taskSchema.parse(row.original);
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
					onKeyDown={async (e) => {
						if (e.key === "Enter" || e.key === " ") {
							e.preventDefault();
							e.stopPropagation();
							setVariantID(row.original.id);
						}
					}}
					onClick={(e) => {
						e.stopPropagation();
						e.preventDefault();
						setVariantID(row.original.id);
					}}
				>
					<Icons.Edit size={14} /> Edit
				</DropdownMenu.Item>
				<DropdownMenu.Item
					className="flex gap-2 "
					onClick={async (e) => {
						e.stopPropagation();
						await deleteVariant([row.original.id]);
					}}
					onKeyDown={async (e) => {
						if (e.key === "Enter" || e.key === " ") {
							e.preventDefault();
							e.stopPropagation();
							await deleteVariant([row.original.id]);
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
