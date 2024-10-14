import type { Routes } from "@blazzing-app/functions";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from "@blazzing-app/ui/form";
import { toast } from "@blazzing-app/ui/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Box,
	Button,
	Card,
	Dialog,
	Flex,
	Grid,
	Heading,
	RadioCards,
	Spinner,
	Switch,
	Text,
	TextField,
} from "@radix-ui/themes";
import { useNavigate } from "@remix-run/react";
import { hc } from "hono/client";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useUser } from "~/hooks/use-user";

export default function Auction() {
	return (
		<Flex
			justify="center"
			p={{ initial: "2", sm: "3" }}
			pb={{ sm: "100px", md: "3" }}
		>
			<Flex justify="center" width="100%" direction="column" maxWidth="1700px">
				<Card className="max-w-[300px] p-0">
					<Heading
						size="6"
						className="p-4 font-freeman justify-center text-accent-11 border-b border-border md:justify-start"
					>
						Live auction
					</Heading>

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

const browserInputSchema = z.object({
	title: z.string(),
	enableChat: z.boolean(),
});
type BrowserStreamInput = z.infer<typeof browserInputSchema>;
const BrowserStream = () => {
	const [isLoading, setLoading] = React.useState(false);
	const methods = useForm<BrowserStreamInput>({
		resolver: zodResolver(browserInputSchema),
		defaultValues: {
			title: "",
			enableChat: false,
		},
	});
	const [honoClient] = React.useState(() => hc<Routes>(window.ENV.WORKER_URL));
	const me = useUser();
	const navigate = useNavigate();

	const onSubmit = async (data: BrowserStreamInput) => {
		setLoading(true);
		if (me) {
			const response = await honoClient.auction["create-stream"].$post({
				json: {
					roomName: data.title,
					metadata: {
						creatorIdentity: me.username ?? "Anon",
						enableChat: data.enableChat,
						allowParticipation: false,
					},
				},
			});
			if (response.ok) {
				const { authToken, connectionDetails } = await response.json();
				return navigate(
					`/dashboard/auction/live?at=${authToken}&rt=${connectionDetails.token}`,
				);
			}
			toast.error("Failed to create stream");
			return;
		}
		setLoading(false);
		toast.error("Unauthenticated");
	};
	return (
		<Form {...methods}>
			<form onSubmit={methods.handleSubmit(onSubmit)}>
				<Box>
					<Grid gap="4">
						<Grid gap="2">
							<FormField
								control={methods.control}
								name="title"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Title</FormLabel>
										<FormControl>
											<TextField.Root
												autoFocus
												variant="soft"
												placeholder="Title"
												{...field}
												value={field.value ?? ""}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
						</Grid>
						<Grid gap="2">
							{/*@ts-ignore*/}
							<FormField
								control={methods.control}
								name="enableChat"
								render={({ field }) => (
									<FormItem className="grid">
										<FormLabel>Enable chat</FormLabel>
										<FormControl>
											<Switch
												checked={field.value ?? false}
												onCheckedChange={field.onChange}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
						</Grid>
					</Grid>
					<Flex gap="3" mt="4" justify="end">
						<Dialog.Close>
							<Button variant="soft" color="gray">
								Cancel
							</Button>
						</Dialog.Close>
						<Button variant="classic" type="submit" disabled={isLoading}>
							{isLoading && <Spinner />}
							Next
						</Button>
					</Flex>
				</Box>
			</form>
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
