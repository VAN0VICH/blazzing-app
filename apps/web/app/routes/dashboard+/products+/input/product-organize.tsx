import { Form, FormControl, FormField, FormItem } from "@blazzing-app/ui/form";
import { Icons } from "@blazzing-app/ui/icons";
import { TagInput } from "@blazzing-app/ui/tag-input";
import type { UpdateProduct } from "@blazzing-app/validators";
import type { Product } from "../../../../../../../packages/validators/src/store-entities";
import { zodResolver } from "@hookform/resolvers/zod";

import {
	Card,
	Flex,
	Heading,
	IconButton,
	Text,
	TextField,
} from "@radix-ui/themes";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
const schema = z.object({
	tags: z.array(z.string()),
	collectionHandle: z.string().optional(),
});

type ProductOrganize = z.infer<typeof schema>;
export function Organize({
	product,
	updateProduct,
}: {
	product: Product | undefined;
	updateProduct: (updates: UpdateProduct["updates"]) => Promise<void>;
}) {
	const [editMode, setEditMode] = React.useState(false);
	const [tags, setTags] = React.useState<string[]>([]);

	const methods = useForm<ProductOrganize>({
		resolver: zodResolver(schema),
		defaultValues: {
			collectionHandle: product?.collectionHandle ?? "",
			tags: [],
		},
	});
	const onSave = React.useCallback(
		async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
			e.preventDefault();
			const values = methods.getValues();
			if (!product) return;
			if (
				values.collectionHandle &&
				values.collectionHandle !== product.collectionHandle
			) {
				await updateProduct({
					...(values.collectionHandle && {
						collectionHandle: values.collectionHandle,
					}),
				});
			}
			setEditMode(false);
		},
		[product, updateProduct, methods.getValues],
	);
	return (
		<Form {...methods}>
			<Card className="p-0 w-full">
				<Flex
					align="center"
					className="border-b border-border"
					p="4"
					justify="between"
				>
					<Heading className="text-accent-11" size="3">
						Organize
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
						Collection handle
					</Text>

					<Flex className="w-full" align="center">
						{editMode ? (
							<FormField
								control={methods.control}
								name="collectionHandle"
								render={({ field }) => (
									<FormItem className="w-full">
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
								{product?.collectionHandle ?? (
									<Icons.Minus className="size-4" />
								)}
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
						Tags
					</Text>

					<Flex className="w-full" wrap="wrap" align="center">
						{editMode ? (
							<TagInput
								value={tags}
								onChange={setTags}
								className="max-w-[300px]"
							/>
						) : (
							<Icons.Minus className="size-4" />
						)}
						{/* {(product.tags ?? []).map((value) => (
												<Badge
													key={value.id}
													className="h-6 bg-accent-3 border-accent-7 border text-accent-11 font-thin text-xs"
												>
													{value.value}
												</Badge>
											))} */}
					</Flex>
				</Flex>
			</Card>
		</Form>
	);
}
