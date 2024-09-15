import { useEffect, useState } from "react";

import {
	DialogContent,
	DialogRoot,
	DialogTitle,
} from "@blazzing-app/ui/dialog-vaul";
import { ToggleGroup, ToggleGroupItem } from "@blazzing-app/ui/toggle-group";
import type { Price } from "@blazzing-app/validators/client";
import { Button, ScrollArea, TextField } from "@radix-ui/themes";

function Currencies({
	opened,
	setOpened,
	id,
	prices,
}: {
	opened: boolean;
	setOpened: (value: boolean) => void;
	id: string | undefined;
	prices: Price[];
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
				<DialogTitle className="p-4">Currencies</DialogTitle>

				<ScrollArea className="h-[calc(100vh-100px)] border-y-[1px] p-2 pt-0">
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
							value={"AUD"}
							key={"AUD"}
							className="rounded-md w-full pl-0"
						>
							<div className="w-16 border-r h-10 flex justify-center items-center">
								{"AUD"}
							</div>
							<div className="w-full">Australian Dollar</div>
						</ToggleGroupItem>
						{/* ))} */}
					</ToggleGroup>
				</ScrollArea>
				<div className="p-4 bg-component">
					<Button
						size="3"
						type="button"
						className="w-full"
						onClick={async () => {}}
					>
						Add
					</Button>
				</div>
			</DialogContent>
		</DialogRoot>
	);
}
export { Currencies };
