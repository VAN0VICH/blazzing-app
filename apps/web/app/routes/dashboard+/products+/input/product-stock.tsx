import React, { useEffect, useState } from "react";

import { cn } from "@blazzing-app/ui";
import type { Variant } from "@blazzing-app/validators/client";
import {
	Box,
	Card,
	Checkbox,
	Flex,
	Grid,
	Heading,
	IconButton,
	Text,
	TextField,
} from "@radix-ui/themes";
import { Icons } from "@blazzing-app/ui/icons";

interface StockProps {
	variant: Variant | undefined | null;
	updateVariant: () => Promise<void>;
	className?: string;
}

const Stock = ({ variant, className }: StockProps) => {
	const [hasCode, setHasCode] = React.useState(false);
	const [editMode, setEditMode] = React.useState(false);

	useEffect(() => {
		if (variant?.barcode ?? variant?.sku) {
			setHasCode(true);
		}
	}, [variant]);

	return (
		<Card className={cn("p-0", className)}>
			<Flex
				justify="between"
				align="center"
				className="border-b border-border"
				p="4"
			>
				<Heading className="   text-accent-11" size="3">
					Stock
				</Heading>

				{editMode ? (
					<Flex gap="4">
						<IconButton
							size="3"
							variant="ghost"
							onClick={() => setEditMode(false)}
						>
							<Icons.Check className="size-4" />
						</IconButton>
						<IconButton
							size="3"
							variant="ghost"
							onClick={() => setEditMode(false)}
						>
							<Icons.Close className="size-4" />
						</IconButton>
					</Flex>
				) : (
					<IconButton
						size="3"
						variant="ghost"
						onClick={() => setEditMode(true)}
					>
						<Icons.Edit className="size-4" />
					</IconButton>
				)}
			</Flex>
			<Box p="4">
				{editMode ? (
					<TextField.Root
						type="number"
						className="my-2 w-20"
						min={0}
						defaultValue={variant?.quantity ?? 1}
						variant="classic"
					/>
				) : (
					<Text
						size="4"
						weight="bold"
						align="center"
						className="text-accent-11"
					>
						{variant?.quantity ?? 1}
					</Text>
				)}
				<Grid pt="2" gap="2">
					<Flex align="center" gap="2">
						<Checkbox size="3" />
						<Text size="2">Continue selling when out of stock</Text>
					</Flex>
					<Flex align="center" gap="2">
						<Checkbox size="3" />
						<Text size="2">This product has SKU or Barcode</Text>
					</Flex>
					<Box>
						{hasCode && (
							<Flex justify="between" gap="3">
								<Grid gap="3">
									<label>SKU</label>
									<TextField.Root defaultValue={variant?.sku ?? ""} />
								</Grid>
								<Grid gap="3">
									<label>Barcode</label>
									<TextField.Root defaultValue={variant?.barcode ?? ""} />
								</Grid>
							</Flex>
						)}
					</Box>
				</Grid>
			</Box>
		</Card>
	);
};

export default Stock;
