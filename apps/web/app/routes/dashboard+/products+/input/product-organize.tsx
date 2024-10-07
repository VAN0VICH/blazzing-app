import { Form } from "@blazzing-app/ui/form";
import { Icons } from "@blazzing-app/ui/icons";
import { TagInput } from "@blazzing-app/ui/tag-input";
import type { Product } from "@blazzing-app/validators/client";
import { zodResolver } from "@hookform/resolvers/zod";

import {
	Button,
	Card,
	Flex,
	Heading,
	IconButton,
	Select,
	Text,
	TextField,
} from "@radix-ui/themes";
import React, { type KeyboardEvent } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
const schema = z.object({
	tags: z.array(z.string()),
});

type ProductOrganize = z.infer<typeof schema>;
export function Organize({
	product,
}: {
	product: Product | undefined;
}) {
	const [editMode, setEditMode] = React.useState(false);
	const [tags, setTags] = React.useState<string[]>([]);

	const methods = useForm<ProductOrganize>({
		resolver: zodResolver(schema),
	});
	console.log("product", product);
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
							<IconButton
								size="3"
								variant="ghost"
								onClick={() => setEditMode(false)}
							>
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
