import React, { useEffect } from "react";

import { cn } from "@blazzing-app/ui";
import { Form, FormControl, FormField, FormItem } from "@blazzing-app/ui/form";
import { Icons } from "@blazzing-app/ui/icons";
import { VariantSchema, type UpdateVariant } from "@blazzing-app/validators";
import type { Variant } from "@blazzing-app/validators/client";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Card,
	Flex,
	Grid,
	Heading,
	IconButton,
	Switch,
	Text,
	TextField,
} from "@radix-ui/themes";
import { useForm } from "react-hook-form";
import type { z } from "zod";

interface StockProps {
	variant: Variant | undefined | null;
	updateVariant: (props: UpdateVariant) => Promise<void>;
}

const schema = VariantSchema.pick({
	quantity: true,
	barcode: true,
	sku: true,
	allowBackorder: true,
});

type ProductInfo = z.infer<typeof schema>;

const Stock = ({ variant, updateVariant }: StockProps) => {
	const [parent] = useAutoAnimate(/* optional config */);
	const [editMode, setEditMode] = React.useState(false);
	const [hasBarcode, setHasBarcode] = React.useState(false);

	const methods = useForm<ProductInfo>({
		resolver: zodResolver(schema),
		defaultValues: {
			barcode: variant?.barcode ?? null,
			quantity: variant?.quantity ?? 1,
			sku: variant?.sku ?? null,
		},
	});
	const onSave = React.useCallback(
		async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
			e.preventDefault();
			const values = methods.getValues();
			if (!variant) return;
			if (
				(values.quantity && values.quantity !== variant.quantity) ||
				(values.barcode && values.barcode !== variant.barcode) ||
				(values.sku && values.sku !== variant.sku) ||
				(values.allowBackorder &&
					values.allowBackorder !== variant.allowBackorder) ||
				(!hasBarcode && (variant.barcode || variant.sku))
			) {
				await updateVariant({
					id: variant.id,
					updates: {
						...(values.quantity && {
							quantity: values.quantity,
						}),
						...(values.barcode && { barcode: values.barcode }),
						...(values.sku && { sku: values.sku }),
						...(values.allowBackorder && {
							allowBackorder: values.allowBackorder,
						}),
						...(!hasBarcode && {
							sku: null,
							barcode: null,
						}),
					},
				});
			}
			setEditMode(false);
		},
		[variant, updateVariant, methods.getValues, hasBarcode],
	);

	useEffect(() => {
		if (variant?.barcode ?? variant?.sku) {
			setHasBarcode(true);
		}
	}, [variant]);

	return (
		<Form {...methods}>
			<Card className="p-0 w-full ">
				<Flex
					p="4"
					justify="between"
					align="center"
					className="border-b border-border"
				>
					<Heading size="3" className="text-accent-11">
						Stock
					</Heading>
					<Flex gap="4" align="center">
						{editMode ? (
							<Flex gap="4">
								<IconButton size="3" variant="ghost" onClick={onSave}>
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
				</Flex>
				<Flex
					justify="between"
					direction="column"
					align="center"
					className="border-b w-full border-border"
				>
					<Flex p="4" className="border-b w-full border-border">
						<Text className="w-full" size="2">
							Quantity
						</Text>

						<Flex className="w-full" align="center">
							{editMode ? (
								<FormField
									control={methods.control}
									name="quantity"
									render={({ field }) => (
										<FormItem>
											<FormControl>
												<TextField.Root
													variant="soft"
													{...field}
													value={field.value ?? ""}
													type="number"
													onChange={(event) =>
														field.onChange(event.target.valueAsNumber)
													}
												/>
											</FormControl>
										</FormItem>
									)}
								/>
							) : (
								<Heading className="text-accent-11" size="2">
									{variant?.quantity ?? 1}
								</Heading>
							)}
						</Flex>
					</Flex>
					<Flex
						height="50px"
						width="100%"
						p="4"
						className="border-b border-border"
					>
						<Text className="w-full" size="2">
							Continue selling when out of stock
						</Text>

						<Flex className="w-full" align="center">
							{editMode ? (
								<FormField
									control={methods.control}
									name="allowBackorder"
									render={({ field }) => (
										<FormItem>
											<FormControl>
												<Switch
													checked={field.value ?? false}
													onCheckedChange={field.onChange}
												/>
											</FormControl>
										</FormItem>
									)}
								/>
							) : (
								<Text size="2">
									{variant?.allowBackorder ? "true" : "false"}
								</Text>
							)}
						</Flex>
					</Flex>
					<Flex
						p="4"
						width="100%"
						className={cn("", {
							"border-b border-border": hasBarcode,
						})}
					>
						<Text className="w-full" size="2">
							This product has SKU or Barcode
						</Text>

						<Flex className="w-full" align="center">
							{editMode ? (
								<Grid gap="2">
									<Switch
										checked={hasBarcode}
										onCheckedChange={setHasBarcode}
									/>
								</Grid>
							) : (
								<Text size="2">{hasBarcode ? "true" : "false"}</Text>
							)}
						</Flex>
					</Flex>
					{hasBarcode && (
						<Flex
							p="4"
							width="100%"
							className="border-b h-[55px] border-border"
						>
							<Text className="w-full" size="2">
								Barcode
							</Text>

							<Flex className="w-full" align="center">
								{editMode ? (
									<Grid gap="2" ref={parent}>
										<FormField
											control={methods.control}
											name="barcode"
											render={({ field }) => (
												<FormItem className="flex gap-2 items-center">
													<FormControl>
														<TextField.Root
															variant="soft"
															{...field}
															value={field.value ?? ""}
														/>
													</FormControl>
												</FormItem>
											)}
										/>
									</Grid>
								) : (
									<Text size="2">
										{variant?.barcode ?? <Icons.Minus className="size-4" />}
									</Text>
								)}
							</Flex>
						</Flex>
					)}
					{hasBarcode && (
						<Flex
							p="4"
							width="100%"
							className="border-b h-[55px] border-border"
						>
							<Text className="w-full" size="2">
								SKU
							</Text>

							<Flex className="w-full" align="center">
								{editMode ? (
									<Grid gap="2" ref={parent}>
										<FormField
											control={methods.control}
											name="sku"
											render={({ field }) => (
												<FormItem className="flex gap-2 items-center">
													<FormControl>
														<TextField.Root
															variant="soft"
															{...field}
															value={field.value ?? ""}
														/>
													</FormControl>
												</FormItem>
											)}
										/>
									</Grid>
								) : (
									<Text size="2">
										{variant?.sku ?? <Icons.Minus className="size-4" />}
									</Text>
								)}
							</Flex>
						</Flex>
					)}
				</Flex>
			</Card>
		</Form>
	);
};

export default Stock;
