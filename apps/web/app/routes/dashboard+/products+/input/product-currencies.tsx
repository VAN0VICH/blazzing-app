import { useEffect, useState } from "react";

import {
	DialogContent,
	DialogRoot,
	DialogTitle,
} from "@blazzing-app/ui/dialog-vaul";
import { ToggleGroup, ToggleGroupItem } from "@blazzing-app/ui/toggle-group";
import { Box, Button, ScrollArea, TextField, Theme } from "@radix-ui/themes";
import type { CreatePrices, StorePrice } from "@blazzing-app/validators";
import { generateID } from "@blazzing-app/utils";

function Currencies({
	opened,
	setOpened,
	createPrices,
	id,
	prices,
}: {
	opened: boolean;
	setOpened: (value: boolean) => void;
	id: string | undefined;
	prices: StorePrice[];
	createPrices: (props: CreatePrices) => Promise<void>;
}) {
	const setDialogOpened = (value: boolean) => {
		if (!value) {
			setCurrencyCodes(Array.from(existingPrices));
		}
		setOpened(value);
	};
	const [existingPrices, setExistingPrices] = useState<string[]>([]);
	const [currencyCodes, setCurrencyCodes] = useState<string[]>([]);
	const [newCurrencyCodes, setNewCurrencyCodes] = useState<string[]>([]);

	useEffect(() => {
		const currencyCodes = prices.map((p) => p.currencyCode);
		setExistingPrices(currencyCodes);
		setCurrencyCodes(currencyCodes);
	}, [prices]);
	return (
		<DialogRoot direction="right" open={opened} onOpenChange={setDialogOpened}>
			<DialogContent className="w-[350px]">
				<Theme className="w-full">
					<DialogTitle className="p-4">Currencies</DialogTitle>

					<ScrollArea className="h-[calc(100vh-150px)] border-y-[1px]  pt-0">
						<Box p="3">
							<TextField.Root type="search" className="mt-4" />
							<ToggleGroup
								value={currencyCodes}
								variant="outline"
								className="flex-wrap pt-4"
								type="multiple"
								onValueChange={(value) => {
									setNewCurrencyCodes(
										value.filter((v) => !existingPrices.includes(v)),
									);
									const unique = new Set([...existingPrices, ...value]);
									setCurrencyCodes(Array.from(unique));
								}}
							>
								{/* {Object.values(currencies).map((c) => ( */}
								<ToggleGroupItem
									value={"BYN"}
									key={"BYN"}
									className="rounded-[5px] w-full pl-0"
								>
									<div className="w-16 border-r h-10 flex justify-center items-center">
										{"BYN"}
									</div>
									<div className="w-full">Belorussian ruble</div>
								</ToggleGroupItem>
								{/* ))} */}
							</ToggleGroup>
						</Box>
					</ScrollArea>
					<div className="p-4 bg-component">
						<Button
							size="3"
							type="button"
							className="w-full"
							onClick={async () => {
								if (id && newCurrencyCodes.length > 0) {
									await createPrices({
										id,
										prices: newCurrencyCodes.map((code) => ({
											id: generateID({ prefix: "price" }),
											amount: 0,
											currencyCode: code,
											variantID: id,
										})),
									});
									setDialogOpened(false);
								}
							}}
						>
							Add
						</Button>
					</div>
				</Theme>
			</DialogContent>
		</DialogRoot>
	);
}
export { Currencies };
