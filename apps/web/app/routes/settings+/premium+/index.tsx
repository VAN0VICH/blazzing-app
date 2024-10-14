import {
	Box,
	Button,
	Card,
	Container,
	Flex,
	Heading,
	RadioCards,
	Text,
} from "@radix-ui/themes";
import React from "react";

const Premium = () => {
	const [term, setTerm] = React.useState<"annual" | "monthly">("annual");
	const handleTermChange = React.useCallback((term: "annual" | "monthly") => {
		setTerm(term);
	}, []);
	return (
		<Container minHeight="100vh">
			<Flex justify="center" align="center" p="4">
				<Card className="max-w-[500px] p-0">
					<Flex
						p="4"
						direction="column"
						justify="between"
						align="center"
						className="border-b border-border"
					>
						<Heading size="6" className="   text-accent-11">
							Blazzing Premium
						</Heading>
						<Text size="2" color="gray" className="font-bold py-2 text-center">
							Go beyond the limits and unlock dozens of exclusive features by
							subscribing to Blazzing Premium
						</Text>
					</Flex>
					<Box p="4">
						<RadioCards.Root value={term} onValueChange={handleTermChange}>
							<RadioCards.Item value="annual">
								<Flex direction="column" width="100%">
									<Text weight="bold">Annual</Text>
									<Text>50$ per year</Text>
								</Flex>
							</RadioCards.Item>
							<RadioCards.Item value="monthly">
								<Flex direction="column" width="100%">
									<Text weight="bold">Monthly</Text>
									<Text>8$ per month</Text>
								</Flex>
							</RadioCards.Item>
						</RadioCards.Root>
						<Box pt="4">
							<Button
								variant="classic"
								className="w-full text-sm"
								size="3"
							>{`Subscribe for ${term === "annual" ? "$50/year" : "$8/month"}`}</Button>
						</Box>
					</Box>
				</Card>
			</Flex>
		</Container>
	);
};
export default Premium;
