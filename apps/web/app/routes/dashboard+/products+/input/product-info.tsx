import { Icons } from "@blazzing-app/ui/icons";
import type { Product, Variant } from "@blazzing-app/validators/client";
import {
	Card,
	Flex,
	Heading,
	IconButton,
	Select,
	Switch,
	Text,
	TextField,
} from "@radix-ui/themes";
import React from "react";
import { ProductStatus } from "~/components/badge/product-status";

export function ProductInfo({
	baseVariant,
	product,
	updateVariant,
	updateProduct,
}: {
	baseVariant: Variant | undefined;
	product: Product | undefined;
	updateVariant: () => Promise<void>;
	updateProduct: () => Promise<void>;
}) {
	const [editMode, setEditMode] = React.useState(false);

	return (
		<Card className="p-0 w-full">
			<Flex
				p="4"
				justify="between"
				align="center"
				className="border-b border-border"
			>
				{editMode ? (
					<TextField.Root
						className="md:min-w-[500px]"
						variant="classic"
						placeholder="Title"
					/>
				) : (
					<Heading className="   text-accent-11" size="3">
						{baseVariant?.title ?? "Untitled"}
					</Heading>
				)}
				<Flex gap="4" align="center">
					{editMode ? (
						<Select.Root defaultValue="apple">
							<Select.Trigger />
							<Select.Content>
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
						<ProductStatus status={product?.status ?? "draft"} />
					)}
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
			</Flex>
			<Flex p="4" height="50px" className="border-b border-border">
				<Text className="w-full" align="center" size="2">
					Description
				</Text>

				<Flex className="w-full" justify="center" align="center">
					{editMode ? (
						<TextField.Root variant="classic" placeholder="Description" />
					) : (
						<Text size="2">
							{baseVariant?.description ?? <Icons.Minus className="size-4 " />}
						</Text>
					)}
				</Flex>
			</Flex>
			<Flex p="4" height="50px" className="border-b border-border">
				<Text className="w-full" align="center" size="2">
					Handle
				</Text>
				<Flex className="w-full" justify="center" align="center">
					{editMode ? (
						<TextField.Root variant="classic" placeholder="Handle" />
					) : (
						<Text size="2">
							{baseVariant?.handle ?? <Icons.Minus className="size-4 " />}
						</Text>
					)}
				</Flex>
			</Flex>
			<Flex height="50px" p="4">
				<Text className="w-full" align="center" size="2">
					Discountable
				</Text>

				<Flex className="w-full" justify="center" align="center">
					{editMode ? (
						<Switch />
					) : (
						<Text size="2">{baseVariant?.discountable ? "true" : "false"}</Text>
					)}
				</Flex>
			</Flex>
		</Card>
	);
}
