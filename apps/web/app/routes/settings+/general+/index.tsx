import { Icons } from "@blazzing-app/ui/icons";
import {
	Avatar,
	Box,
	Button,
	Card,
	Container,
	Flex,
	Grid,
	Heading,
	IconButton,
	Select,
	Text,
	TextField,
} from "@radix-ui/themes";

export default function General() {
	return (
		<Container px={{ initial: "2", xs: "4" }} pb={{ initial: "9", md: "0" }}>
			<Flex py="6" direction={{ initial: "column", xs: "row" }}>
				<Box
					width={{ initial: "25%", md: "100%" }}
					my={{ initial: "4", xs: "0" }}
				>
					<Heading as="h2" size="4" className="text-accent-11">
						Details
					</Heading>
				</Box>
				<Box width="100%" p="3">
					<Card className="p-0">
						<Flex p="4" gap="2" className="border-b border-border">
							<Avatar size="2" fallback="A" src={undefined} />
							<Button size="2" variant="classic">
								Upload image
							</Button>
						</Flex>
						<Box p="4" className="border-b border-border">
							<Flex gap="4" pb="2">
								<Grid gap="2">
									<Text>First name</Text>
									<TextField.Root variant="soft" />
								</Grid>
								<Grid gap="2">
									<Text>First name</Text>
									<TextField.Root variant="soft" />
								</Grid>
							</Flex>
							<Text size="2" as="p" color="gray" className="py-2">
								Use your first and last name as they appear on your
								government-issued ID.
							</Text>
						</Box>
						<Box p="4" className="border-b border-border">
							<Flex justify="between" align="center">
								<Grid gap="2">
									<Text>Email</Text>
									<Text>{"opachimari@gmail.com"}</Text>
								</Grid>
								<Grid gap="2">
									<Text>Verified</Text>
									<Flex justify="center" align="start">
										<Icons.CircleCheck className="text-accent-11" />
									</Flex>
								</Grid>
								<Grid gap="2">
									<IconButton size="2" variant={"ghost"}>
										<Icons.Edit className="size-5 text-accent-11" />
									</IconButton>
								</Grid>
							</Flex>
						</Box>
						<Box p="4">
							<Flex align="center" justify="between">
								<Grid gap="2">
									<Text>{"Phone number (optional)"} </Text>
									<Text>{"No phone number"}</Text>
								</Grid>
								<Grid gap="2">
									<IconButton size="2" variant={"ghost"}>
										<Icons.Edit className="size-5 text-accent-11" />
									</IconButton>
								</Grid>
							</Flex>
						</Box>
					</Card>
				</Box>
			</Flex>

			<Flex
				className="border-t"
				py="6"
				direction={{ initial: "column", xs: "row" }}
			>
				<Box
					width={{ initial: "25%", md: "100%" }}
					my={{ initial: "4", xs: "0" }}
				>
					<Heading as="h2" size="4" className="text-accent-11">
						Stores
					</Heading>
				</Box>

				<Box width={{ initial: "75%", md: "100%" }} />
			</Flex>
			<Flex
				className="border-t"
				py="6"
				direction={{ initial: "column", xs: "row" }}
			>
				<Box
					width={{ initial: "25%", md: "100%" }}
					my={{ initial: "4", xs: "0" }}
				>
					<Heading as="h2" size="4" className="text-accent-11">
						Language
					</Heading>
				</Box>
				<Box width="100%">
					<Card className="p-0">
						<Box className="border-b border-border" p="4">
							<Grid gap="2">
								<Text>Language</Text>
								<Select.Root defaultValue="apple">
									<Select.Trigger variant="soft" />
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
							</Grid>
						</Box>

						<Grid gap="2" p="4">
							<Heading as="h3" size="3">
								Regional format
							</Heading>
							<Text color="gray" size="2" className="py-2">
								Your number, time, date, and currency formats are set for
								American English. Change regional format.
							</Text>
						</Grid>
					</Card>
				</Box>
			</Flex>
			<Flex
				className="border-t border-border"
				py="6"
				direction={{ initial: "column", xs: "row" }}
			>
				<Box
					width={{ initial: "25%", md: "100%" }}
					my={{ initial: "4", xs: "0" }}
				>
					<Heading as="h2" size="4" className="text-accent-11">
						Timezone
					</Heading>
				</Box>
				<Box width="100%">
					<Card className="p-0">
						<Box className="border-b border-border" p="4">
							<Grid gap="2">
								<Text>Timezone</Text>

								<Select.Root defaultValue="apple">
									<Select.Trigger variant="soft" />
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
								<Text color="gray" size="2" className="py-2">
									Your number, time, date, and currency formats are set for
									American English. Change regional format.
								</Text>
							</Grid>
						</Box>
					</Card>
				</Box>
			</Flex>
		</Container>
	);
}
