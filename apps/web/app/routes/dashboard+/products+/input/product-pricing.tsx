import { cn } from "@blazzing-app/ui";
import { Icons } from "@blazzing-app/ui/icons";
import type { Price } from "@blazzing-app/validators/client";
import React from "react";
import { isTouchDevice } from "~/utils/helpers";
import { Currencies } from "./product-currencies";
import {
	Card,
	DropdownMenu,
	Flex,
	Heading,
	IconButton,
	Text,
	TextField,
	Tooltip,
} from "@radix-ui/themes";

interface ProductPricingProps {
	prices: Price[];
	variantID: string | undefined;
	isPublished: boolean;
	className?: string;
}
function Pricing({
	prices,
	variantID,
	isPublished,
	className,
}: ProductPricingProps) {
	const [opened, setOpened] = React.useState(false);
	return (
		<>
			<Card className="p-0">
				<Flex
					justify="between"
					align="center"
					className="border-b border-border p-4Flex"
					p="4"
				>
					<Heading className="   text-accent-11" size="3">
						Pricing
						{isPublished && (
							<Tooltip
								delayDuration={250}
								content="You can't edit prices on a published product."
							>
								<Icons.CircleInfo
									className="text-accent-11"
									aria-hidden="true"
									size={20}
								/>
							</Tooltip>
						)}
					</Heading>
					<IconButton size="3" variant="ghost">
						<Icons.Edit className="size-4" />
					</IconButton>
				</Flex>
				{prices.length === 0 && (
					<Flex width="100%" height="50px" justify="center" align="center">
						<Text color="gray" size="2">
							Add price.
						</Text>
					</Flex>
				)}
				{prices.map((price) => (
					<Flex align="center" gap="2" key={price.currencyCode}>
						<label className="w-[3rem] font-bold">{price.currencyCode}</label>
						<TextField.Root
							type="number"
							disabled={isPublished}
							defaultValue={price.amount / 100}
						/>
						<IconButton
							type="button"
							className="rounded-lg aspect-square bg-component w-full h-full border hover:bg- gray-2 border-border flex justify-center items-center"
							onKeyDown={async (e) => {
								if (e.key === "Enter" || e.key === " ") {
									e.preventDefault();
									e.stopPropagation();
								}
							}}
						>
							<Icons.Close className="text- gray-11" size={20} />
						</IconButton>
					</Flex>
				))}
			</Card>

			<Currencies
				prices={prices}
				id={variantID}
				opened={opened}
				setOpened={setOpened}
			/>
		</>
	);
}
export { Pricing };
