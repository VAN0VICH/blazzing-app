import { Icons } from "@blazzing-app/ui/icons";
import type { Product } from "@blazzing-app/validators/client";
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
	const [opened, setOpened] = React.useState(false);
	const [dropdownOpened, setDropdownOpened] = React.useState(false);

	const methods = useForm<ProductOrganize>({
		resolver: zodResolver(schema),
	});
	const onSubmit: SubmitHandler<ProductOrganize> = (data) => {
		console.log("data", data);
	};
	console.log("product", product);
	return (
		<Card className="p-0 w-full">
			<Flex
				align="center"
				className="border-b border-border"
				p="4"
				justify="between"
			>
				<Heading className="   text-accent-11" size="3">
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
				<Text className="w-full" align="center" size="2">
					Type
				</Text>

				<Flex className="w-full" justify="center" align="center">
					{editMode ? (
						<Select.Root defaultValue="apple">
							<Select.Trigger />
							<Select.Content className="backdrop-blur-sm">
								<Select.Group>
									<Select.Label>Fruits</Select.Label>
									<Select.Item value="orange">Orange</Select.Item>
									<Select.Item value="apple">Apple</Select.Item>
									<Select.Item value="grape" disabled>
										Grape
									</Select.Item>
								</Select.Group>
								<Select.Separator />
								<Select.Group>
									<Select.Label>Vegetables</Select.Label>
									<Select.Item value="carrot">Carrot</Select.Item>
									<Select.Item value="potato">Potato</Select.Item>
								</Select.Group>
							</Select.Content>
						</Select.Root>
					) : (
						<Icons.Minus className="size-4" />
					)}
				</Flex>
			</Flex>

			<Flex
				p="4"
				height="50px"
				className="border-b border-border"
				align="center"
			>
				<Text className="w-full" align="center" size="2">
					Tags
				</Text>

				<Flex className="w-full" wrap="wrap" justify="center" align="center">
					{editMode ? (
						<TextField.Root variant="classic" />
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
	);
}
