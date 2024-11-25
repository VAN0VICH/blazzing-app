import { Icons } from "@blazzing-app/ui/icons";
import type { Variant } from "../../../../../../../packages/validators/src/store-entities";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { DropdownMenu, IconButton } from "@radix-ui/themes";
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
				<IconButton variant="ghost" className="mr-[0.5px]">
					<DotsHorizontalIcon className="h-4 w-4 text-gray-11" />
				</IconButton>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content
				align="center"
				className="w-[160px] backdrop-blur-sm"
			>
				<DropdownMenu.Item
					className="flex gap-2 px-2 hover:bg-accent-3 hover:text-accent-11 text-red-11"
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
					className="flex gap-2 px-2 hover:bg-red-3 hover:text-red-11 text-red-11"
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
