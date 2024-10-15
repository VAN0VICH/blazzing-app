import { Icons } from "@blazzing-app/ui/icons";
import type { CreatePrices, UpdatePrice } from "@blazzing-app/validators";
import type { Price } from "@blazzing-app/validators/client";
import {
	Card,
	Flex,
	Heading,
	IconButton,
	Text,
	TextField,
	Tooltip,
} from "@radix-ui/themes";
import React from "react";
import { useReplicache } from "~/zustand/replicache";
import { Currencies } from "./product-currencies";

interface ProductPricingProps {
	prices: Price[];
	variantID: string | undefined;
	isPublished: boolean;
}
function Pricing({ prices, variantID, isPublished }: ProductPricingProps) {
	const [opened, setOpened] = React.useState(false);
	const dashboardRep = useReplicache((state) => state.dashboardRep);

	const updatePrice = React.useCallback(
		async ({ priceID, updates, id }: UpdatePrice) => {
			await dashboardRep?.mutate.updatePrice({
				priceID,
				updates,
				id,
			});
		},
		[dashboardRep],
	);
	const createPrices = React.useCallback(
		async (props: CreatePrices) => {
			await dashboardRep?.mutate.createPrices(props);
		},
		[dashboardRep],
	);
	const deletePrices = React.useCallback(
		async (priceID: string) => {
			variantID &&
				(await dashboardRep?.mutate.deletePrices({
					id: variantID,
					priceIDs: [priceID],
				}));
		},
		[dashboardRep, variantID],
	);
	return (
		<>
			<Card className="p-0">
				<Flex
					justify="between"
					align="center"
					className="border-b border-border p-4 "
					p="4"
				>
					<Flex align="center" gap="1">
						<Heading className="text-accent-11" size="3">
							Pricing
						</Heading>
						{isPublished && (
							<Tooltip
								delayDuration={250}
								content="You can't edit prices on a published product."
							>
								<Icons.CircleInfo
									className="text-accent-11 size-4"
									aria-hidden="true"
								/>
							</Tooltip>
						)}
					</Flex>
					<IconButton size="3" variant="ghost" onClick={() => setOpened(true)}>
						<Icons.PlusSquare className="size-4" />
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
					<PriceComponent
						price={price}
						variantID={variantID}
						key={price.id}
						deletePrices={deletePrices}
						updatePrice={updatePrice}
						isPublished={isPublished}
					/>
				))}
			</Card>

			<Currencies
				createPrices={createPrices}
				prices={prices}
				id={variantID}
				opened={opened}
				setOpened={setOpened}
			/>
		</>
	);
}

const PriceComponent = ({
	price,
	variantID,
	deletePrices,
	updatePrice,
	isPublished,
}: {
	price: Price;
	variantID: string | undefined;
	updatePrice: ({ priceID, updates, id }: UpdatePrice) => Promise<void>;
	deletePrices: (priceID: string) => Promise<void>;
	isPublished: boolean;
}) => {
	const [editMode, setEditMode] = React.useState(false);
	const [amount, setAmount] = React.useState(price.amount / 100);

	const onSave = React.useCallback(
		async ({ amount }: { amount: number }) => {
			if (Math.round(amount * 100) !== price.amount && variantID) {
				await updatePrice({
				  priceID: price.id,
				  id: variantID,
				  updates: {
					amount: Math.round(amount * 100),
				  },
				});
			  }

			setEditMode(false);
		},
		[variantID, price, updatePrice],
	);
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const cleanedValue = e.currentTarget.value.replace(/,/g, "");
		if (cleanedValue === "") {
			setAmount(0); // Optional: You can set it to 0 or handle it differently
			return;
		}

		let value = Number.parseFloat(cleanedValue);
		if (Number.isNaN(value)) {
			value = 0;
		}
		setAmount(value);
	};

	return (
		<Flex align="center" gap="4" p="4">
			<Text className="w-[3rem]">{price.currencyCode}</Text>
			{editMode ? (
				<TextField.Root
					className="w-full"
					type="number"
					value={amount === 0 ? "" : amount} // Display empty when 0 for easier input
					onChange={handleInputChange}
				/>
			) : (
				<Heading size="3" className="w-full text-accent-11">
					{amount}
				</Heading>
			)}
			{editMode ? (
				<Flex gap="4">
					<IconButton
						variant="ghost"
						type="button"
						onClick={() =>
							!isPublished &&
							onSave({
								amount,
							})
						}
						disabled={isPublished}
					>
						<Icons.Check className="size-4" />
					</IconButton>
					<IconButton
						type="button"
						variant="ghost"
						onClick={() => {
							setAmount(price.amount / 100);
							setEditMode(false);
						}}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault();
								e.stopPropagation();
								setAmount(price.amount / 100);
								setEditMode(false);
							}
						}}
					>
						<Icons.Close className="size-4" />
					</IconButton>
				</Flex>
			) : (
				<Flex gap="4">
					<IconButton
						variant="ghost"
						type="button"
						onClick={() => !isPublished && setEditMode(true)}
						disabled={isPublished}
					>
						<Icons.Edit className="size-4" />
					</IconButton>
					<IconButton
						type="button"
						variant="ghost"
						onClick={async () => await deletePrices(price.id)}
						onKeyDown={async (e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault();
								e.stopPropagation();
								await deletePrices(price.id);
							}
						}}
					>
						<Icons.Trash className="size-4" />
					</IconButton>
				</Flex>
			)}
		</Flex>
	);
};
export { Pricing };
