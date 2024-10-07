import React from "react";

import { Icons } from "@blazzing-app/ui/icons";
import { TagInput } from "@blazzing-app/ui/tag-input";
import { generateID } from "@blazzing-app/utils";
import type {
	DeleteProductOption,
	InsertProductOption,
	InsertProductOptionValue,
} from "@blazzing-app/validators";
import type { ProductOption } from "@blazzing-app/validators/client";
import {
	Badge,
	Card,
	Flex,
	Grid,
	Heading,
	IconButton,
	Text,
	TextField,
} from "@radix-ui/themes";
import { useReplicache } from "~/zustand/replicache";

interface CreateOptionProps {
	productID: string;
	options: ProductOption[];
}
export function ProductOptions({ productID, options }: CreateOptionProps) {
	const [tempOptions, setTempOptions] = React.useState<InsertProductOption[]>(
		[],
	);
	const createTempOption = React.useCallback(() => {
		const id = generateID({ prefix: "p_option" });
		const option: InsertProductOption = { id, productID };
		setTempOptions((prev) => [...prev, option]);
	}, [productID]);
	const dashboardRep = useReplicache((state) => state.dashboardRep);
	const createOption = React.useCallback(
		async ({
			option,
			values,
		}: { option: InsertProductOption; values?: string[] }) => {
			if (option.name)
				await dashboardRep?.mutate.createProductOption({
					option,
					...(values &&
						values.length > 0 && {
							optionValues: values.map((value) => ({
								id: generateID({ prefix: "p_op_val" }),
								optionID: option.id,
								value,
								option,
							})),
						}),
				});
		},
		[dashboardRep],
	);
	const deleteOption = React.useCallback(
		async ({ optionID }: Omit<DeleteProductOption, "productID">) => {
			await dashboardRep?.mutate.deleteProductOption({
				optionID,
				productID,
			});
		},
		[dashboardRep, productID],
	);
	const updateOption = React.useCallback(
		async ({ optionID, name }: { optionID: string; name: string }) => {
			await dashboardRep?.mutate.updateProductOption({
				optionID,
				productID,
				updates: { name },
			});
		},
		[dashboardRep, productID],
	);
	const updateValues = React.useCallback(
		async (optionID: string, values: string[]) => {
			const newOptionValues: InsertProductOptionValue[] = options
				? values.map((value) => ({
						id: generateID({ prefix: "p_op_val" }),
						optionID,
						value,
						option: options.find((o) => o.id === optionID),
					}))
				: [];
			await dashboardRep?.mutate.updateProductOptionValues({
				optionID,
				productID,
				newOptionValues,
			});
		},
		[dashboardRep, options, productID],
	);
	return (
		<Card className="p-0">
			<Flex
				justify="between"
				align="center"
				className="border-b border-border"
				p="4"
			>
				<Heading size="3" className="text-accent-11">
					Options <span className="text-accent-8 text-xs">{"(Optional)"}</span>
				</Heading>
				<Flex gap="2" align="start">
					<IconButton size="3" variant="ghost" onClick={createTempOption}>
						<Icons.PlusSquare className="size-4" />
					</IconButton>
				</Flex>
			</Flex>
			<Grid>
				{options.length === 0 && tempOptions.length === 0 && (
					<Flex width="100%" height="100px" justify="center" align="center">
						<Text color="gray" size="2">
							Create options to add variants for this product.
						</Text>
					</Flex>
				)}
				<Grid gap="2">
					{options.map((op) => (
						<OptionInput
							option={op}
							fresh={false}
							key={op.id}
							createOption={createOption}
							deleteOption={deleteOption}
							updateOption={updateOption}
							updateOptionValues={updateValues}
							setTempOptions={setTempOptions}
						/>
					))}
				</Grid>
				<Grid gap="2" pt="2">
					{tempOptions.map((op) => (
						<OptionInput
							option={op}
							fresh={true}
							key={op.id}
							createOption={createOption}
							deleteOption={deleteOption}
							updateOption={updateOption}
							updateOptionValues={updateValues}
							setTempOptions={setTempOptions}
						/>
					))}
				</Grid>
			</Grid>
		</Card>
	);
}

const OptionInput = ({
	createOption,
	deleteOption,
	updateOption,
	updateOptionValues,
	setTempOptions,
	option,
	fresh,
}: {
	option: Omit<ProductOption, "name" | "version"> & {
		name?: string | null;
		version?: number;
	};
	createOption: (props: {
		option: InsertProductOption;
		values?: string[];
	}) => Promise<void>;
	deleteOption: ({
		optionID,
	}: Omit<DeleteProductOption, "productID">) => Promise<void>;
	updateOption: ({
		optionID,
		name,
	}: {
		optionID: string;
		name: string;
	}) => Promise<void>;
	setTempOptions: React.Dispatch<
		React.SetStateAction<
			{
				id: string;
				productID: string;
				name?: string | null;
				version?: number;
			}[]
		>
	>;
	updateOptionValues: (optionID: string, values: string[]) => Promise<void>;
	fresh?: boolean;
}) => {
	const [editMode, setEditMode] = React.useState(fresh ?? false);
	const [optionName, setOptionName] = React.useState(option.name ?? "");
	const [optionValues, setOptionValues] = React.useState<string[]>([]);
	console.log("option", option);

	const onSave = React.useCallback(
		async ({
			optionName,
			values,
		}: { optionName: string | undefined; values: string[] }) => {
			const valuesChanged =
				(option.optionValues ?? []).length !== values.length ||
				(option.optionValues ?? []).some((v) =>
					values.some((value) => value !== v.value),
				);

			optionName &&
				optionName !== option.name &&
				(await updateOption({
					optionID: option.id,
					name: optionName,
				}));

			valuesChanged && (await updateOptionValues(option.id, values));
			setEditMode(false);
		},
		[updateOption, updateOptionValues, option],
	);
	React.useEffect(() => {
		if (option.optionValues) {
			setOptionValues(option.optionValues.map((ov) => ov.value));
		}
	}, [option.optionValues]);
	return (
		<Flex gap="3" align="center" className="border-b border-border" p="4">
			<Grid width={{ initial: "100%", sm: "40%" }}>
				{editMode ? (
					<TextField.Root
						className="w-full"
						variant="soft"
						autoFocus={!optionName}
						value={optionName}
						onChange={(e) => setOptionName(e.target.value)}
					/>
				) : (
					<Text size="3">{optionName}</Text>
				)}
			</Grid>
			<Grid width={{ initial: "100%", sm: "60%" }}>
				{editMode ? (
					<TagInput
						value={optionValues}
						onChange={setOptionValues}
						className="max-w-[500px]"
					/>
				) : (
					<Flex gap="1">
						{optionValues.map((ov) => (
							<Badge key={ov} size="1" className="h-6" variant="surface">
								{ov}
							</Badge>
						))}
					</Flex>
				)}
			</Grid>
			<Flex>
				{editMode ? (
					<Flex gap="4">
						<IconButton
							size="3"
							variant="ghost"
							onClick={async () => {
								if (fresh) {
									await createOption({
										option: { ...option, name: optionName },
									});
									setTempOptions((prev) =>
										prev.filter((op) => op.id !== option.id),
									);
								}
								return onSave({
									optionName,
									values: optionValues,
								});
							}}
						>
							<Icons.Check className="size-4" />
						</IconButton>
						<IconButton
							size="3"
							variant="ghost"
							onClick={() => {
								if (fresh)
									return setTempOptions((prev) =>
										prev.filter((o) => o.id !== option.id),
									);
								setEditMode(false);
							}}
						>
							{fresh ? (
								<Icons.Trash className="size-4" />
							) : (
								<Icons.Close
									className="size-4"
									onClick={() => {
										setOptionValues(
											option.optionValues?.map((v) => v.value) ?? [],
										);
										setOptionName(option.name ?? "");
									}}
								/>
							)}
						</IconButton>
					</Flex>
				) : (
					<Flex gap="4">
						<IconButton
							size="3"
							variant="ghost"
							onClick={() => setEditMode(true)}
						>
							<Icons.Edit className="size-4" />
						</IconButton>
						<IconButton
							size="3"
							variant="ghost"
							onClick={() => {
								if (fresh)
									return setTempOptions((prev) =>
										prev.filter((o) => o.id !== option.id),
									);
								deleteOption({
									optionID: option.id,
								});
							}}
						>
							<Icons.Trash className="size-4" />
						</IconButton>
					</Flex>
				)}
			</Flex>
		</Flex>
	);
};
