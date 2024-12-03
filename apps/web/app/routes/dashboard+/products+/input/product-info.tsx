import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@blazzing-app/ui/form";
import { Icons } from "@blazzing-app/ui/icons";
import {
	VariantSchema,
	type Product,
	type UpdateProduct,
	type UpdateVariant,
	type Variant,
} from "@blazzing-app/validators";

import { zodResolver } from "@hookform/resolvers/zod";
import {
	Card,
	Flex,
	Heading,
	IconButton,
	Select,
	Switch,
	Text,
	TextArea,
	TextField,
} from "@radix-ui/themes";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ProductStatus } from "~/components/badge/product-status";

const schema = VariantSchema.pick({
	title: true,
	description: true,
	handle: true,
	discountable: true,
}).and(
	z.object({
		status: z.enum(["draft", "published", "archived"]),
	}),
);

type ProductInfo = z.infer<typeof schema>;

export function ProductInfo({
	baseVariant,
	product,
	updateVariant,
	updateProduct,
}: {
	baseVariant: Variant | undefined;
	product: Product | undefined;
	updateVariant: (props: UpdateVariant) => Promise<void>;
	updateProduct: (updates: UpdateProduct["updates"]) => Promise<void>;
}) {
	const [editMode, setEditMode] = React.useState(false);

	const methods = useForm<ProductInfo>({
		resolver: zodResolver(schema),
		defaultValues: {
			description: baseVariant?.description ?? "",
			discountable: baseVariant?.discountable ?? false,
			handle: baseVariant?.handle ?? "",
			status: product?.status ?? "draft",
			title: baseVariant?.title ?? "",
		},
	});

	const onSave = React.useCallback(
		async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
			e.preventDefault();
			const values = methods.getValues();
			if (!baseVariant) return;
			if (values.status && values.status !== product?.status) {
				await updateProduct({
					status: values.status,
				});
			}
			if (
				(values.description &&
					values.description !== baseVariant.description) ||
				(values.title && values.title !== baseVariant.title) ||
				(values.handle && values.handle !== baseVariant.handle) ||
				(values.discountable !== undefined &&
					values.discountable !== baseVariant.discountable)
			) {
				await updateVariant({
					id: baseVariant.id,
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
		[
			baseVariant,
			product?.status,
			updateProduct,
			updateVariant,
			methods.getValues,
		],
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
							{baseVariant?.title ?? "Untitled"}
						</Heading>
					)}
					<Flex gap="4" align="center">
						{editMode ? (
							<FormField
								control={methods.control}
								name="status"
								render={({ field }) => (
									<FormItem>
										<FormControl>
											<Select.Root
												value={field.value ?? "draft"}
												onValueChange={field.onChange}
											>
												<Select.Trigger />
												<Select.Content>
													<Select.Group>
														<Select.Item
															value="draft"
															className="hover:bg-accent-3 hover:text-accent-11"
														>
															Draft
														</Select.Item>
														<Select.Item
															value="published"
															className="hover:bg-accent-3 hover:text-accent-11"
														>
															Published
														</Select.Item>
														<Select.Item
															value="archived"
															className="hover:bg-accent-3 hover:text-accent-11"
														>
															Archived
														</Select.Item>
													</Select.Group>
												</Select.Content>
											</Select.Root>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						) : (
							<ProductStatus status={product?.status ?? "draft"} size="3" />
						)}
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
									<FormItem className="w-full">
										<FormControl>
											<TextArea
												variant="soft"
												className="w-full"
												{...field}
												value={field.value ?? ""}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
						) : (
							<Text size="2">
								{baseVariant?.description ?? (
									<Icons.Minus className="size-4 " />
								)}
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
									<FormItem className="w-full">
										<FormControl>
											<TextField.Root
												variant="soft"
												placeholder="Handle"
												className="w-full"
												{...field}
												value={field.value ?? ""}
											>
												<TextField.Slot>/</TextField.Slot>
											</TextField.Root>
										</FormControl>
									</FormItem>
								)}
							/>
						) : (
							<Text size="2">
								{baseVariant?.handle ?? <Icons.Minus className="size-4 " />}
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
							<Text size="2">
								{baseVariant?.discountable ? "true" : "false"}
							</Text>
						)}
					</Flex>
				</Flex>
			</Card>
		</Form>
	);
}
