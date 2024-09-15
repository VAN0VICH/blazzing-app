import { Icons, strokeWidth } from "@blazzing-app/ui/icons";
import { cn } from "@blazzing-app/ui";
import { Link } from "@remix-run/react";
import React from "react";
import {
	AspectRatio,
	Avatar,
	Box,
	Button,
	Dialog,
	Flex,
	Grid,
	Heading,
	Skeleton,
	Strong,
	Text,
} from "@radix-ui/themes";
import type { Store } from "@blazzing-app/validators/client";
import { ClientOnly } from "remix-utils/client-only";
import { EditStore } from "./edit-store";

export function StoreInfo({
	store,
	storeURL,
	isDashboard = false,
}: {
	store: Store;
	storeURL?: string;
	isDashboard?: boolean;
}) {
	const [aboutOpen, setAboutOpen] = React.useState(false);
	const Slot = storeURL ? Link : Box;
	const isInitialized = true;
	return (
		<Grid
			columns={{ initial: "2", xs: "3", sm: "4", md: "5" }}
			position="relative"
			gap="3"
			maxHeight="220px"
		>
			<Slot
				to={storeURL!}
				className={cn("flex h-full items-center 	col-span-1")}
			>
				<AspectRatio ratio={1 / 1} className=" max-w-[220px] max-h-[220px] ">
					<Avatar fallback="F" className="w-full h-full  " />
				</AspectRatio>
			</Slot>
			<Flex
				justify="between"
				gridColumn="3"
				direction="column"
				className="col-span-1 xs:col-span-2 md:col-span-3 lg:col-span-4"
				maxHeight="220px"
			>
				<Box>
					{!isInitialized ? (
						<Grid gap="2">
							<Skeleton width="100px" height="15px" />
							<Skeleton width="100px" height="15px" mt="1" />
						</Grid>
					) : (
						<Slot to={storeURL!} className="flex flex-col">
							<Heading
								size={{ initial: "3", md: "5" }}
								as="h2"
								className={cn(
									"line-clamp-2    flex-grow leading-none tracking-tight",
								)}
							>
								{store?.name ?? ""}
							</Heading>
							<span>
								<Text color="gray" as="p" size="2" className={cn("py-1", {})}>
									@{store?.owner?.username ?? "Unknown"}
								</Text>
							</span>
						</Slot>
					)}
					<AboutStore
						isOpen={aboutOpen}
						setIsOpen={setAboutOpen}
						store={store}
						isInitialized={isInitialized}
					/>
				</Box>

				<Box className={cn("pt-4")}>
					<Flex gap="3" wrap="wrap">
						{!isInitialized ? (
							<>
								<Skeleton width="100px" height="15px" />
								<Skeleton width="100px" height="15px" />
							</>
						) : (
							<>
								<Text size={{ initial: "1", xs: "2", md: "3" }}>
									<Strong className="text-accent-11">0</Strong> following
								</Text>
								<Text size={{ initial: "1", xs: "2", md: "3" }}>
									<Strong className="text-accent-11">{0}</Strong> products
								</Text>
							</>
						)}
					</Flex>
					{/* <Button className="mt-2">Follow</Button> */}
					{store && isDashboard ? (
						<ClientOnly>{() => <EditStore store={store} />}</ClientOnly>
					) : (
						<Button variant="surface" className="mt-2">
							Follow
						</Button>
					)}
					{!store && isDashboard && (
						<Button variant="ghost" className="mt-2">
							Edit store
						</Button>
					)}
				</Box>
			</Flex>
		</Grid>
	);
}

const AboutStore = ({
	isOpen,
	setIsOpen,
	store,
	isInitialized,
}: {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
	store: Store | undefined | null;
	isInitialized?: boolean;
}) => {
	return (
		<Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
			<Dialog.Trigger>
				<span className="flex items-center cursor-pointer text- gray-11">
					{!isInitialized ? (
						<Skeleton className="w-[300px] h-[10px]" />
					) : (
						<Text
							size={{ initial: "2", sm: "3" }}
							color="gray"
							className="line-clamp-1"
						>
							{store?.description ?? ""}
						</Text>
					)}

					<Icons.Right size={17} strokeWidth={strokeWidth} />
				</span>
			</Dialog.Trigger>
			<Dialog.Content className="md:w-[600px] backdrop-blur-sm">
				<Dialog.Title className="text-accent-11">About</Dialog.Title>
				<Text>{store?.description}</Text>
			</Dialog.Content>
		</Dialog.Root>
	);
};
