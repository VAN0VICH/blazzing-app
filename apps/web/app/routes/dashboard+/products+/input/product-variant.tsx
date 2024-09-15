import { Drawer, DrawerContent } from "@blazzing-app/ui/drawer";
import { Icons, strokeWidth } from "@blazzing-app/ui/icons";
import type { Product } from "@blazzing-app/validators/client";
import { IconButton, ScrollArea } from "@radix-ui/themes";
import { VariantInput } from "../variant-input";

interface ProductVariantProps {
	setIsOpen: (value: boolean) => void;
	isOpen: boolean;
	variantID: string | null;
	product: Product | undefined;
	setVariantID: (id: string | null) => void;
}

export default function ProductVariant({
	isOpen,
	setIsOpen,
	variantID,
	product,
	setVariantID,
}: Readonly<ProductVariantProps>) {
	return (
		<Drawer open={isOpen} onOpenChange={setIsOpen}>
			<DrawerContent className="mt-3 flex w-full items-center pt-4 gap-0">
				<IconButton
					type="button"
					variant={"ghost"}
					className="hidden lg:flex absolute top-4 right-4"
					onClick={() => setVariantID(null)}
				>
					<Icons.Close size={20} strokeWidth={strokeWidth} />
				</IconButton>
				<div className="w-full flex justify-center">
					<ScrollArea className="h-[85vh]	 w-full lg:p-6 py-2">
						<VariantInput
							product={product}
							variant={undefined}
							updateVariant={()=>{
								return new Promise((resolve)=>resolve())
							}}
						/>
					</ScrollArea>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
