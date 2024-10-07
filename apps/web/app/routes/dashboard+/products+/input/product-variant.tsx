import { Drawer, DrawerContent } from "@blazzing-app/ui/drawer";
import { Icons, strokeWidth } from "@blazzing-app/ui/icons";
import type { Product } from "@blazzing-app/validators/client";
import { Flex, IconButton, ScrollArea, Theme } from "@radix-ui/themes";
import { VariantInput } from "../variant-input";
import { useReplicache } from "~/zustand/replicache";
import { useDashboardStore } from "~/zustand/store";
import type { UpdateVariant } from "@blazzing-app/validators";
import React from "react";

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
	const rep = useReplicache((state) => state.dashboardRep);
	const variantMap = useDashboardStore((state) => state.variantMap);
	const variant = variantMap.get(variantID ?? "");

	const updateVariant = React.useCallback(
		async (props: UpdateVariant) => {
			if (rep) {
				await rep.mutate.updateVariant({
					id: props.id,
					updates: props.updates,
				});
			}
		},
		[rep],
	);
	return (
		<Drawer open={isOpen} onOpenChange={setIsOpen}>
			<DrawerContent className="mt-3 flex w-full  items-center pt-4 gap-0">
				<Theme className="w-full">
					<IconButton
						type="button"
						variant={"ghost"}
						className="hidden lg:flex absolute top-4 right-4"
						onClick={() => setVariantID(null)}
					>
						<Icons.Close size={20} strokeWidth={strokeWidth} />
					</IconButton>
					<div className="w-full flex justify-center">
						<ScrollArea className="h-[85vh]	flex justify-center w-full lg:p-6 py-2">
							<Flex justify="center">
								<VariantInput
									product={product}
									variant={variant}
									updateVariant={updateVariant}
								/>
							</Flex>
						</ScrollArea>
					</div>
				</Theme>
			</DrawerContent>
		</Drawer>
	);
}
