import { Icons, strokeWidth } from "@blazzing-app/ui/icons";
import { cn } from "@blazzing-app/ui";
import { Link } from "@remix-run/react";
import React from "react";
import {
	Avatar,
	Box,
	Button,
	Dialog,
	Flex,
	Heading,
	Skeleton,
	Text,
} from "@radix-ui/themes";
import type { Store } from "@blazzing-app/validators/client";

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
	const Slot = storeURL ? Link : "div";
	const isInitialized = true;
	return (
		<section>
			<div className={cn("relative flex h-full w-full p-0 pt-8 gap-4 ")}>
				<Slot
					to={storeURL!}
					className={cn("flex h-full items-center md:w-[230px]")}
				>
					<Avatar fallback="F" />
				</Slot>
				<section className="h-full w-full">
					{!isInitialized ? (
						<div className="flex flex-col gap-2">
							<Skeleton width="100px" height="15px" />
							<Skeleton width="100px" height="15px" mt="1" />
						</div>
					) : (
						<Slot to={storeURL!} className="flex flex-col">
							<Heading
								className={cn(
									"line-clamp-2 font-freeman flex-grow leading-none tracking-tight",
								)}
							>
								{store?.name ?? ""}
							</Heading>
							<span>
								<Heading as="h2" className={cn("py-1", {})}>
									@{store?.owner?.username}
								</Heading>
							</span>
						</Slot>
					)}
					<AboutStore
						isOpen={aboutOpen}
						setIsOpen={setAboutOpen}
						store={store}
						isInitialized={isInitialized}
					/>

					<Box className={cn("pt-4")}>
						<Flex gap="3" wrap="wrap">
							{!isInitialized ? (
								<>
									<Skeleton width="100px" height="15px" />
									<Skeleton width="100px" height="15px" />
								</>
							) : (
								<>
									<Heading>
										<p className="font-bold text-black dark:text-white">0</p>{" "}
										following
									</Heading>
									<Heading>
										<p className="font-bold text-black dark:text-white">{0}</p>{" "}
										products
									</Heading>
								</>
							)}
						</Flex>
						{/* <Button className="mt-2">Follow</Button> */}
						{/* {store && isDashboard && (
							<ClientOnly>{() => <EditStore store={store} />}</ClientOnly>
						)} */}
						{!store && isDashboard && (
							<Button variant="ghost" className="mt-2">
								Edit store
							</Button>
						)}
					</Box>
				</section>
			</div>
		</section>
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
				<span className="flex items-center cursor-pointer text-slate-11">
					{!isInitialized ? (
						<Skeleton className="w-[300px] h-[10px]" />
					) : (
						<p className="line-clamp-1">{store?.description ?? ""}</p>
					)}

					<Icons.Right size={17} strokeWidth={strokeWidth} />
				</span>
			</Dialog.Trigger>
			<Dialog.Content className="md:w-[600px]">
				<Dialog.Title>About</Dialog.Title>
				<Text>{store?.description}</Text>
			</Dialog.Content>
		</Dialog.Root>
	);
};
