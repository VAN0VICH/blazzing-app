import { Icons } from "@blazzing-app/ui/icons";
import { useChat, useDataChannel } from "@livekit/components-react";
import {
	Avatar,
	Button,
	Card,
	Dialog,
	Flex,
	Grid,
	Heading,
	Skeleton,
	Strong,
	Text,
} from "@radix-ui/themes";
import { useState } from "react";

export function AuctionActions() {
	const [encoder] = useState(() => new TextEncoder());
	const { send } = useDataChannel("reactions");
	const { send: sendChat } = useChat();

	const onSend = (emoji: string) => {
		send(encoder.encode(emoji), { reliable: false });
		if (sendChat) {
			sendChat(emoji);
		}
	};

	return (
		<Flex
			gap="2"
			px={{ initial: "1", xs: "2", md: "4" }}
			align="center"
			justify="between"
			className="border-t border-accent-5 dark:bg-accent-3 bg-gray-3 h-[80px] lg:h-[120px] text-center"
		>
			<ProductSlot />
			<ProductBidInfo />

			<Bidders />

			<Button variant="solid">End Stream</Button>
		</Flex>
	);
}
const Bidders = () => {
	return (
		<Dialog.Root>
			<Dialog.Trigger>
				<Grid gap="2">
					<Text
						as="label"
						size="1"
						weight="medium"
						className="text-accent-11 hidden lg:block"
					>
						Highest bidder
					</Text>
					<Card className="p-2 flex items-center justify-center">
						<Flex gap="2">
							<Avatar fallback="F" className="size-10" />
							<Grid gap="2" className="hidden lg:grid">
								<Skeleton minWidth="50px" />
								<Skeleton minWidth="70px" />
							</Grid>
						</Flex>
					</Card>
				</Grid>
			</Dialog.Trigger>

			<Dialog.Content
				maxWidth="450px"
				className="bg-component backdrop-blur-sm"
			>
				<Flex gap="3" mt="4" justify="end">
					<Dialog.Close>
						<Button variant="soft" color="gray">
							Cancel
						</Button>
					</Dialog.Close>
					<Dialog.Close>
						<Button>Save</Button>
					</Dialog.Close>
				</Flex>
			</Dialog.Content>
		</Dialog.Root>
	);
};
const ProductBidInfo = () => {
	return (
		<Flex align="center" gap="2">
			<Text className="hidden sm:block">Bid:</Text>
			<Heading
				className="text-green-9"
				size={{ initial: "2", xs: "3", sm: "4", md: "5", lg: "6" }}
			>
				$1000
			</Heading>
		</Flex>
	);
};
const ProductSlot = () => {
	return (
		<Flex gap="4" align="center">
			<Flex gap="2">
				<Avatar fallback="F" className="size-10" />
				<Grid gap="2" className="hidden lg:grid">
					<Skeleton minWidth="50px" />
					<Skeleton minWidth="70px" />
				</Grid>
			</Flex>
			<Button variant="outline" className="hidden md:flex">
				Change
			</Button>
			<Button variant="classic" size={{ initial: "2", md: "4" }}>
				<Icons.Gavel className="hidden xs:block" />
				SOLD
			</Button>
		</Flex>
	);
};
