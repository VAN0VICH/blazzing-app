import type { Product, Variant } from "@blazzing-app/validators/client";
import { Card, Flex, Heading } from "@radix-ui/themes";
import React, { useCallback } from "react";
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
	console.log("isOpen", isOpen);

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
					deleteVariant={() => {
						return new Promise((resolve) => resolve());
					}}
					generateVariants={() => {
						return new Promise((resolve) => resolve(1));
					}}
				/>
			</Card>
		</>
	);
}
