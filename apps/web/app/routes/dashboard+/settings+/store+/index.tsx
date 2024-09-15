import { Icons } from "@blazzing-app/ui/icons";
import {
	Avatar,
	Box,
	Button,
	Card,
	Flex,
	Grid,
	Heading,
	IconButton,
	Text,
	TextArea,
	TextField,
} from "@radix-ui/themes";
import React from "react";
import { store } from "~/temp/mock-entities";

export default function Store() {
	const [editMode, setEditMode] = React.useState(false);
	return (
		<Grid>
			<Flex
				direction={{ initial: "column", xs: "row" }}
				pb="6"
				className="border-b"
			>
				<Box width="30%" className="hidden lg:block">
					<Heading as="h2" size="4" className="text-accent-11">
						Store
					</Heading>
				</Box>

				<Box width="100%">
					<Card className="p-0">
						<Flex p="4" gap="2" className="border-b border-border">
							<Avatar size="2" fallback="A" src={undefined} />
							<Button size="2" variant="classic">
								Upload image
							</Button>
						</Flex>
						<Flex
							p="4"
							justify="between"
							className="border-b border-border"
							gap="2"
							position="relative"
						>
							<Grid gap="2" width="100%">
								<Grid gap="2">
									<Text weight="medium" className="text-accent-11">
										Name
									</Text>
									{editMode ? (
										<TextField.Root
											variant="classic"
											className="max-w-[300px]"
										/>
									) : (
										<Text size="4" weight="bold">
											{store.name}
										</Text>
									)}
								</Grid>
								<Grid gap="2">
									<Text weight="medium" className="text-accent-11">
										Description
									</Text>
									{editMode ? (
										<TextArea variant="classic" />
									) : (
										<Text size="3">{store.description}</Text>
									)}
								</Grid>
							</Grid>
							{editMode ? (
								<Flex gap="4" position="absolute" top="4" right="4">
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
									className="absolute top-4 right-4"
									onClick={() => setEditMode(true)}
								>
									<Icons.Edit className="size-5" />
								</IconButton>
							)}
						</Flex>
					</Card>
				</Box>
			</Flex>
			<Flex direction={{ initial: "column", xs: "row" }} py="6">
				<Box width="30%" className="hidden lg:block">
					<Heading as="h2" size="4" className="text-accent-11">
						Currencies
					</Heading>
				</Box>

				<Box width="100%">
					<Card className="p-0">
						<Flex p="4" gap="2" className="border-b border-border">
							<Avatar size="2" fallback="A" src={undefined} />
							<Button size="2" variant="classic">
								Upload image
							</Button>
						</Flex>
						<Flex
							p="4"
							justify="between"
							className="border-b border-border"
							gap="2"
							position="relative"
						>
							<Grid gap="2" width="100%">
								<Grid gap="2">
									<Text weight="medium" className="text-accent-11">
										Name
									</Text>
									{editMode ? (
										<TextField.Root
											variant="classic"
											className="max-w-[300px]"
										/>
									) : (
										<Text size="4" weight="bold">
											{store.name}
										</Text>
									)}
								</Grid>
								<Grid gap="2">
									<Text weight="medium" className="text-accent-11">
										Description
									</Text>
									{editMode ? (
										<TextArea variant="classic" />
									) : (
										<Text size="3">{store.description}</Text>
									)}
								</Grid>
							</Grid>
							{editMode ? (
								<Flex gap="4" position="absolute" top="4" right="4">
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
									className="absolute top-4 right-4"
									onClick={() => setEditMode(true)}
								>
									<Icons.Edit className="size-5" />
								</IconButton>
							)}
						</Flex>
					</Card>
				</Box>
			</Flex>
		</Grid>
	);
}
