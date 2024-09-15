import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import {
	Box,
	Button,
	Card,
	Dialog,
	Flex,
	Grid,
	RadioCards,
	Switch,
	Text,
	TextField,
} from "@radix-ui/themes";
import { Form, useNavigate } from "@remix-run/react";
import React from "react";
import { z } from "zod";
import { PageHeader } from "../components/page-header";

export default function Auction() {
	return (
		<Flex
			justify="center"
			p={{ initial: "2", sm: "3" }}
			pb={{ sm: "100px", md: "3" }}
			maxWidth="1300px"
		>
			<Flex justify="center" width="100%" direction="column">
				<Card className="max-w-[300px] p-0">
					<PageHeader title="Live auction" className="p-4" />
					<Box p="4">
						<StartAuctionDialog />
					</Box>
				</Card>
			</Flex>
		</Flex>
	);
}

const StartAuctionDialog = () => {
	const [mode, setMode] = React.useState<"browser" | "obs">();
	return (
		<Dialog.Root onOpenChange={() => setMode(undefined)}>
			<Dialog.Trigger>
				<Button variant="classic" className="w-full">
					Start
				</Button>
			</Dialog.Trigger>

			<Dialog.Content maxWidth="450px">
				{!mode ? (
					<Options setMode={setMode} />
				) : mode === "browser" ? (
					<BrowserStream />
				) : null}
			</Dialog.Content>
		</Dialog.Root>
	);
};
const BrowserStream = () => {
	const navigate = useNavigate();
	const [form, fields] = useForm({
		defaultValue: {
			enableChat: false,
			name: "",
			title: "",
		},
		onValidate: (data) =>
			parseWithZod(data.formData, {
				schema: z.object({
					title: z.string().min(1),
					name: z.string().min(1),
					enableChat: z.boolean(),
				}),
			}),

		onSubmit: async (_, { submission }) => {
			if (submission?.status === "success") {
				console.log("value", submission.value);
				navigate("/dashboard/auction/livep");
				// const response = await client.auction["create-stream"].$post({
				// 	json: {
				// 		metadata: {
				// 			allowParticipation: false,
				// 			creatorIdentity: submission.value.name,
				// 			enableChat: submission.value.enableChat,
				// 		},
				// 		roomName: submission.value.title,
				// 	},
				// });
				// if (response.ok) {
				// 	const {
				// 		authToken,
				// 		connectionDetails: { token },
				// 	} = await response.json();
				// 	navigate(`/dashboard/auction/live&at=${authToken}&rt=${token}`);
				// }
			}
		},
	});
	return (
		<Form {...getFormProps(form)}>
			<Grid gap="4">
				<Grid gap="2">
					<Text as="label">Title</Text>
					<TextField.Root
						autoFocus
						{...getInputProps(fields.title, { type: "text" })}
					/>
				</Grid>
				<Grid gap="2">
					<Text as="label">Name</Text>
					<TextField.Root {...getInputProps(fields.name, { type: "text" })} />
				</Grid>
				<Grid gap="2">
					<Text as="label">Enable chat</Text>
					{/*@ts-ignore*/}
					<Switch />
				</Grid>
			</Grid>
			<Flex gap="3" mt="4" justify="end">
				<Dialog.Close>
					<Button variant="soft" color="gray">
						Cancel
					</Button>
				</Dialog.Close>
				<Button
					variant="classic"
					type="submit"
					onClick={() => navigate("/dashboard/auction/live")}
				>
					Next
				</Button>
			</Flex>
		</Form>
	);
};

const Options = ({
	setMode,
}: {
	setMode: (mode: "browser" | "obs") => void;
}) => {
	const [tempMode, setTempMode] = React.useState<"browser" | "obs">("browser");
	return (
		<>
			<RadioCards.Root
				columns="2"
				value={tempMode}
				onValueChange={(value) => setTempMode(value as "browser" | "obs")}
			>
				<RadioCards.Item value="browser" className="h-40">
					<Flex direction="column" width="100%">
						<Text weight="bold" className="text-accent-11">
							Stream from browser
						</Text>
					</Flex>
				</RadioCards.Item>
				<RadioCards.Item value="obs" className="h-40">
					<Flex direction="column" width="100%">
						<Text weight="bold" className="text-accent-11">
							Stream from OBS
						</Text>
					</Flex>
				</RadioCards.Item>
			</RadioCards.Root>

			<Flex gap="3" mt="4" justify="end">
				<Dialog.Close>
					<Button variant="soft" color="gray">
						Cancel
					</Button>
				</Dialog.Close>
				<Button
					variant="classic"
					type="submit"
					onClick={() => setMode(tempMode)}
				>
					Next
				</Button>
			</Flex>
		</>
	);
};
