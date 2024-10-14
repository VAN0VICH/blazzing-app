import { Form, FormControl, FormField, FormItem } from "@blazzing-app/ui/form";
import { Icons } from "@blazzing-app/ui/icons";
import { VariantSchema, type UpdateVariant } from "@blazzing-app/validators";
import type { Variant } from "@blazzing-app/validators/client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Card,
	Flex,
	Heading,
	IconButton,
	Switch,
	Text,
	TextArea,
	TextField,
} from "@radix-ui/themes";
import React from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

const schema = VariantSchema.pick({
	title: true,
	description: true,
	handle: true,
	discountable: true,
});

type ProductInfo = z.infer<typeof schema>;

export function VariantInfo({
	variant,
	updateVariant,
}: {
	variant: Variant | undefined;
	updateVariant: (props: UpdateVariant) => Promise<void>;
}) {
	const [editMode, setEditMode] = React.useState(false);
	const methods = useForm<ProductInfo>({
		resolver: zodResolver(schema),
		defaultValues: {
			description: variant?.description ?? "",
			discountable: variant?.discountable ?? false,
			handle: variant?.handle ?? "",
			title: variant?.title ?? "",
		},
	});

	const onSave = React.useCallback(
		async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
			e.preventDefault();
			const values = methods.getValues();
			if (!variant) return;
			if (
				(values.description && values.description !== variant.description) ||
				(values.title && values.title !== variant.title) ||
				(values.handle && values.handle !== variant.handle) ||
				(values.discountable !== undefined &&
					values.discountable !== variant.discountable)
			) {
				await updateVariant({
					id: variant.id,
					updates: {
						...(values.description && {
							description: values.description,
						}),
						...(values.title && { title: values.title }),
						...(values.handle && { handle: values.handle }),
						...(values.discountable !== undefined && {
							discountable: values.discountable,
						}),
					},
				});
			}
			setEditMode(false);
		},
		[variant, updateVariant, methods.getValues],
	);

	return (
		<Form {...methods}>
			<Card className="p-0 w-full">
				<Flex
					p="4"
					justify="between"
					align="center"
					className="border-b border-border"
				>
					{editMode ? (
						<FormField
							control={methods.control}
							name="title"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<TextField.Root
											className="md:min-w-[500px]"
											variant="soft"
											placeholder="Title"
											{...field}
											value={field.value ?? ""}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
					) : (
						<Heading className="text-accent-11" size="3">
							{variant?.title ?? "Untitled"}
						</Heading>
					)}
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
				<Flex p="4" className="border-b border-border">
					<Text className="w-full" size="2">
						Description
					</Text>

					<Flex className="w-full" align="center">
						{editMode ? (
							<FormField
								control={methods.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormControl>
											<TextArea {...field} value={field.value ?? ""} />
										</FormControl>
									</FormItem>
								)}
							/>
						) : (
							<Text size="2">
								{variant?.description ?? <Icons.Minus className="size-4 " />}
							</Text>
						)}
					</Flex>
				</Flex>
				<Flex p="4" height="50px" className="border-b border-border">
					<Text className="w-full" size="2">
						Handle
					</Text>
					<Flex className="w-full" align="center">
						{editMode ? (
							<FormField
								control={methods.control}
								name="handle"
								render={({ field }) => (
									<FormItem>
										<FormControl>
											<TextField.Root
												variant="soft"
												placeholder="Handle"
												{...field}
												value={field.value ?? ""}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
						) : (
							<Text size="2">
								{variant?.handle ?? <Icons.Minus className="size-4 " />}
							</Text>
						)}
					</Flex>
				</Flex>
				<Flex height="50px" p="4">
					<Text className="w-full" size="2">
						Discountable
					</Text>

					<Flex className="w-full" align="center">
						{editMode ? (
							<FormField
								control={methods.control}
								name="discountable"
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
							<Text size="2">{variant?.discountable ? "true" : "false"}</Text>
						)}
					</Flex>
				</Flex>
			</Card>
		</Form>
	);
}
