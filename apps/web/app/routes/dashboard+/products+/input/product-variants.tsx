import { generateID } from "@blazzing-app/utils";
import type {
	Product,
	Variant,
} from "../../../../../../../packages/validators/src/store-entities";
import { Card, Flex, Heading } from "@radix-ui/themes";
import React, { useCallback } from "react";
import { useReplicache } from "~/zustand/replicache";
import VariantTable from "../variant-table/table";
import ProductVariant from "./product-variant";

interface ProductVariantsProps {
	productID: string;
	product: Product | undefined;
	variants: Variant[];
	baseVariant: Variant | null | undefined;
	isPublished: boolean;
}
export function Variants({
	productID,
	product,
	variants,
	baseVariant,
}: ProductVariantsProps) {
	const dashboardRep = useReplicache((state) => state.dashboardRep);
	const [variantID, _setVariantID] = React.useState<string | null>(null);

	const [isOpen, setIsOpen] = React.useState(false);
	const setVariantID = useCallback((id: string | null) => {
		if (id === null) {
			setIsOpen(false);
		} else {
			setIsOpen(true);
		}
		_setVariantID(id);
	}, []);

	const generateVariants = React.useCallback(async () => {
		if (!product) return;
		await dashboardRep?.mutate.generateVariants({
			productID,
			newVariantIDs: Array.from({
				length: (product?.options?.length ?? 0) * 10,
			}).map(() => generateID({ prefix: "variant" })),
			newPricesIDs: Array.from({
				length: (baseVariant?.prices ?? []).length ?? 1,
			}).map(() => generateID({ prefix: "price" })),
			...(baseVariant?.prices && {
				prices: baseVariant.prices.map((p) => ({
					...p,
					id: generateID({ prefix: "price" }),
					variantID: "whatever",
				})),
			}),
		});
	}, [dashboardRep, productID, product, baseVariant]);

	const deleteVariant = React.useCallback(
		async (keys: string[]) => {
			if (dashboardRep) {
				await dashboardRep.mutate.deleteVariant({
					keys,
				});
			}
		},
		[dashboardRep],
	);

	return (
		<>
			<ProductVariant
				isOpen={isOpen}
				setIsOpen={setIsOpen}
				product={product}
				setVariantID={setVariantID}
				variantID={variantID}
			/>

			<Card className="p-0">
				<Flex
					justify="between"
					align="center"
					className="border-b border-border"
					p="4"
				>
					<Heading className="   text-accent-11" size="3">
						Variants{" "}
						<span className="text-accent-8 text-xs">{"(Optional)"}</span>
					</Heading>
				</Flex>
				<VariantTable
					setVariantID={setVariantID}
					variants={variants ?? []}
					deleteVariant={deleteVariant}
					generateVariants={generateVariants}
				/>
			</Card>
		</>
	);
}
