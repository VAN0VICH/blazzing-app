import { Icons } from "@blazzing-app/ui/icons";
import { ISO_1666 } from "@blazzing-app/validators";
import type { Variant } from "@blazzing-app/validators/client";
import {
	Card,
	DropdownMenu,
	Flex,
	Heading,
	IconButton,
	Select,
	Text,
	TextField,
} from "@radix-ui/themes";
import React from "react";
import { isTouchDevice } from "~/utils/helpers";

export function Attributes({
	variant,
}: {
	variant: Variant | undefined;
}) {
	const [opened, setOpened] = React.useState(false);
	const [dropdownOpened, setDropdownOpened] = React.useState(false);
	const countries = React.useMemo(() => Object.entries(ISO_1666), []);
	const [editMode, setEditMode] = React.useState(false);

	return (
		<Card className="p-0">
			<Flex
				align="center"
				justify="between"
				className="border-b border-border"
				p="4"
			>
				<Heading className="   text-accent-11" size="3">
					Attributes
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
					Height
				</Text>

				<Flex className="w-full" justify="center" align="center">
					{editMode ? (
						<TextField.Root variant="classic" />
					) : (
						<Text>{variant?.height ?? <Icons.Minus className="size-4" />}</Text>
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
					Width
				</Text>

				<Flex className="w-full" justify="center" align="center">
					{editMode ? (
						<TextField.Root variant="classic" />
					) : (
						<Text>{variant?.width ?? <Icons.Minus className="size-4" />}</Text>
					)}
				</Flex>
			</Flex>
			<Flex
				height="50px"
				p="4"
				className="border-b border-border"
				align="center"
			>
				<Text className="w-full" align="center" size="2">
					Length
				</Text>

				<Flex className="w-full" justify="center" align="center">
					{editMode ? (
						<TextField.Root variant="classic" />
					) : (
						<Text>{variant?.length ?? <Icons.Minus className="size-4" />}</Text>
					)}
				</Flex>
			</Flex>
			<Flex
				height="50px"
				p="4"
				className="border-b border-border"
				align="center"
			>
				<Text className="w-full" align="center" size="2">
					Weight
				</Text>

				<Flex className="w-full" justify="center" align="center">
					{editMode ? (
						<TextField.Root variant="classic" />
					) : (
						<Text>{variant?.weight ?? <Icons.Minus className="size-4" />}</Text>
					)}
				</Flex>
			</Flex>
			<Flex
				height="50px"
				p="4"
				className="border-b border-border"
				align="center"
			>
				<Text className="w-full" align="center" size="2">
					Material
				</Text>

				<Flex className="w-full" justify="center" align="center">
					{editMode ? (
						<TextField.Root variant="classic" />
					) : (
						<Text>
							{variant?.material ?? <Icons.Minus className="size-4" />}
						</Text>
					)}
				</Flex>
			</Flex>
			<Flex height="50px" p="4" align="center">
				<Text className="w-full" align="center" size="2">
					Origin
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
						<Text>
							{variant?.originCountry ? (
								//@ts-ignore
								ISO_1666[variant.originCountry]
							) : (
								<Icons.Minus className="size-4" />
							)}
						</Text>
					)}
				</Flex>
			</Flex>
		</Card>
	);
}
