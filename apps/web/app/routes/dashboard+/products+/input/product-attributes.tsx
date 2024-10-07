import { Form, FormControl, FormField, FormItem } from "@blazzing-app/ui/form";
import { Icons } from "@blazzing-app/ui/icons";
import { toast } from "@blazzing-app/ui/toast";
import {
	ISO_1666,
	VariantSchema,
	type UpdateVariant,
} from "@blazzing-app/validators";
import type { Variant } from "@blazzing-app/validators/client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Card,
	Flex,
	Heading,
	IconButton,
	Select,
	Text,
	TextField,
} from "@radix-ui/themes";
import React from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

const schema = VariantSchema.pick({
	weight: true,
	width: true,
	height: true,
	length: true,
	material: true,
	originCountry: true,
});

type ProductAttributes = z.infer<typeof schema>;

export function Attributes({
	variant,
	updateVariant,
}: {
	variant: Variant | undefined;
	updateVariant: (props: UpdateVariant) => Promise<void>;
}) {
	const countries = React.useMemo(() => Object.entries(ISO_1666), []);
	const [editMode, setEditMode] = React.useState(false);

	const methods = useForm<ProductAttributes>({
		resolver: zodResolver(schema),
		defaultValues: {
			height: variant?.height ?? null,
			width: variant?.width ?? null,
			length: variant?.length ?? null,
			weight: variant?.weight ?? null,
			material: variant?.material ?? null,
			originCountry: variant?.originCountry ?? null,
		},
	});
	const onSave = React.useCallback(
		async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
			e.preventDefault();
			const values = methods.getValues();
			if (!variant) return;
			if (
				(values.height && values.height !== variant.height) ||
				(values.length && values.length !== variant.length) ||
				(values.width && values.width !== variant.width) ||
				(values.material && values.material !== variant.material) ||
				(values.weight && values.weight !== variant.weight) ||
				(values.originCountry && values.originCountry !== variant.originCountry)
			) {
				await updateVariant({
					id: variant.id,
					updates: {
						...(values.height && {
							height: values.height,
						}),
						...(values.length && { length: values.length }),
						...(values.width && { width: values.width }),
						...(values.weight && { weight: values.weight }),
						...(values.material && { material: values.material }),
						...(values.originCountry && {
							originCountry: values.originCountry,
						}),
					},
				});
			}
			setEditMode(false);
		},
		[variant, updateVariant, methods.getValues],
	);
	console.log("variant", variant?.originCountry);

	return (
		<Form {...methods}>
			<Card className="p-0">
				<Flex
					align="center"
					justify="between"
					className="border-b border-border"
					p="4"
				>
					<Heading className="text-accent-11" size="3">
						Attributes
					</Heading>
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
				<Flex
					p="4"
					height="50px"
					className="border-b border-border"
					align="center"
				>
					<Text className="w-full" size="2">
						Height
					</Text>

					<Flex className="w-full" align="center">
						{editMode ? (
							<FormField
								control={methods.control}
								name="height"
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
							<Text size="2">
								{variant?.height ?? <Icons.Minus className="size-4" />}
							</Text>
						)}
					</Flex>
				</Flex>
				<Flex
					p="4"
					height="50px"
					className="border-b border-border"
					align="center"
				>
					<Text className="w-full" size="2">
						Width
					</Text>

					<Flex className="w-full" align="center">
						{editMode ? (
							<FormField
								control={methods.control}
								name="width"
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
							<Text size="2">
								{variant?.width ?? <Icons.Minus className="size-4" />}
							</Text>
						)}
					</Flex>
				</Flex>
				<Flex
					height="50px"
					p="4"
					className="border-b border-border"
					align="center"
				>
					<Text className="w-full" size="2">
						Length
					</Text>

					<Flex className="w-full" align="center">
						{editMode ? (
							<FormField
								control={methods.control}
								name="length"
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
							<Text size="2">
								{variant?.length ?? <Icons.Minus className="size-4" />}
							</Text>
						)}
					</Flex>
				</Flex>
				<Flex
					height="50px"
					p="4"
					className="border-b border-border"
					align="center"
				>
					<Text className="w-full" size="2">
						Weight
					</Text>

					<Flex className="w-full" align="center">
						{editMode ? (
							<FormField
								control={methods.control}
								name="weight"
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
							<Text size="2">
								{variant?.weight ?? <Icons.Minus className="size-4" />}
							</Text>
						)}
					</Flex>
				</Flex>
				<Flex
					height="50px"
					p="4"
					className="border-b border-border"
					align="center"
				>
					<Text className="w-full" size="2">
						Material
					</Text>

					<Flex className="w-full" align="center">
						{editMode ? (
							<FormField
								control={methods.control}
								name="material"
								render={({ field }) => (
									<FormItem>
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
						) : (
							<Text size="2">
								{variant?.material ?? <Icons.Minus className="size-4" />}
							</Text>
						)}
					</Flex>
				</Flex>
				<Flex height="50px" p="4" align="center">
					<Text className="w-full" size="2">
						Origin
					</Text>

					<Flex className="w-full" align="center">
						{editMode ? (
							<FormField
								control={methods.control}
								name="originCountry"
								render={({ field }) => (
									<FormItem>
										<FormControl>
											<Select.Root
												value={field.value ?? "Australia"}
												onValueChange={field.onChange}
											>
												<Select.Trigger />
												<Select.Content>
													<Select.Group>
														{countries.map(([_, name]) => (
															<Select.Item key={name} value={name}>
																{name}
															</Select.Item>
														))}
													</Select.Group>
													<Select.Separator />
												</Select.Content>
											</Select.Root>
										</FormControl>
									</FormItem>
								)}
							/>
						) : (
							<Text size="2">
								{variant?.originCountry ? (
									//@ts-ignore
									variant.originCountry
								) : (
									<Icons.Minus className="size-4" />
								)}
							</Text>
						)}
					</Flex>
				</Flex>
			</Card>
		</Form>
	);
}
