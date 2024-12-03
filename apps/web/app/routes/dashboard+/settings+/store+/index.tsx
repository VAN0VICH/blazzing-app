import type { Routes } from "@blazzing-app/functions";
import type { DashboardMutatorsType } from "@blazzing-app/replicache";
import { cn } from "@blazzing-app/ui";
import { Form, FormControl, FormField, FormItem } from "@blazzing-app/ui/form";
import { Icons } from "@blazzing-app/ui/icons";
import { toast } from "@blazzing-app/ui/toast";
import { generateID } from "@blazzing-app/utils";
import type { Image as ImageType } from "@blazzing-app/validators";
import { EmailSchema, type Store as StoreType } from "@blazzing-app/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Avatar,
	Box,
	Button,
	Card,
	Dialog,
	Flex,
	Grid,
	Heading,
	IconButton,
	Spinner,
	Text,
	TextArea,
	TextField,
} from "@radix-ui/themes";
import * as base64 from "base64-arraybuffer";
import { hc } from "hono/client";
import React from "react";
import type { Area, Point } from "react-easy-crop";
import Cropper from "react-easy-crop";
import { useForm } from "react-hook-form";
import type { Replicache } from "replicache";
import { z } from "zod";
import getCroppedImg from "~/utils/crop";
import { toImageURL } from "~/utils/helpers";
import { useReplicache } from "~/zustand/replicache";
import { useDashboardStore } from "~/zustand/store";
const schema = z.object({
	name: z.string(),
	description: z.string(),
});

type StoreUpdate = z.infer<typeof schema>;
export default function Store() {
	const [editMode, setEditMode] = React.useState(false);
	const activeStoreID = useDashboardStore((state) => state.activeStoreID);
	const dashboardRep = useReplicache((state) => state.dashboardRep);
	const storeMap = useDashboardStore((state) => state.storeMap);
	const store = storeMap.get(activeStoreID ?? "");
	const [isLoading, setIsLoading] = React.useState(false);
	const methods = useForm<StoreUpdate>({
		resolver: zodResolver(schema),
		defaultValues: {
			name: store?.name ?? "",
			description: store?.description ?? "",
		},
	});

	const onSave = React.useCallback(
		async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
			setIsLoading(true);
			const honoClient = hc<Routes>(window.ENV.WORKER_URL);
			e.preventDefault();
			const values = methods.getValues();
			if (!store) return;
			const descriptionChanged =
				values.description && values.description !== store.description;
			const nameChanged = values.name && values.name !== store.name;

			if (descriptionChanged || nameChanged) {
				let nameExists = false;
				if (nameChanged) {
					const response = await honoClient.store.name.$get(
						{
							query: {
								name: values.name,
							},
						},

						{
							headers: {
								"x-publishable-key": window.ENV.BLAZZING_PUBLISHABLE_KEY,
							},
						},
					);
					if (response.ok) {
						const { result } = await response.json();
						if (result) {
							toast.error("Name already exists");
							nameExists = true;
						}
					}
				}
				await dashboardRep?.mutate.updateStore({
					id: store.id,
					updates: {
						...(descriptionChanged && { description: values.description }),
						...(nameChanged && !nameExists && { name: values.name }),
					},
				});
			}
			setIsLoading(false);
			setEditMode(false);
		},
		[store, methods.getValues, dashboardRep],
	);

	return (
		<Form {...methods}>
			<Grid>
				<Flex direction={{ initial: "column", xs: "row" }} pb="6">
					<Box width="30%" className="hidden lg:block">
						<Heading as="h2" size="5" className="font-freeman text-accent-11">
							General
						</Heading>
					</Box>

					<Box width="100%">
						<Card className="p-0 max-w-xl">
							<ImageUpload store={store} />
							<Flex
								p="4"
								justify="between"
								className="border-b border-border"
								gap="2"
								position="relative"
							>
								<Grid gap="2" width="100%">
									<Grid gap="2">
										<Text weight="medium" size="3" className="text-accent-11">
											name
										</Text>
										{editMode ? (
											<FormField
												control={methods.control}
												name="name"
												render={({ field }) => (
													<FormItem>
														<FormControl>
															<TextField.Root
																variant="soft"
																className="max-w-[300px]"
																{...field}
																value={field.value ?? ""}
															/>
														</FormControl>
													</FormItem>
												)}
											/>
										) : (
											<Text size="3">{store?.name}</Text>
										)}
									</Grid>
									<Grid gap="2">
										<Text weight="medium" size="3" className="text-accent-11">
											description
										</Text>
										{editMode ? (
											<FormField
												control={methods.control}
												name="description"
												render={({ field }) => (
													<FormItem>
														<FormControl>
															<TextArea variant="soft" {...field} />
														</FormControl>
													</FormItem>
												)}
											/>
										) : (
											<Text size="3">
												{store?.description ?? (
													<Text className="text-gray-11" size="3">
														Nothing...
													</Text>
												)}
											</Text>
										)}
									</Grid>
								</Grid>
								{editMode ? (
									<Flex gap="4" position="absolute" top="4" right="4">
										<IconButton size="2" variant="ghost" onClick={onSave}>
											{isLoading ? (
												<Spinner className="size-4" />
											) : (
												<Icons.Check className="size-4" />
											)}
										</IconButton>
										<IconButton
											size="2"
											variant="ghost"
											onClick={() => setEditMode(false)}
										>
											<Icons.Close className="size-4" />
										</IconButton>
									</Flex>
								) : (
									<IconButton
										size="2"
										variant="ghost"
										className="absolute top-4 right-4"
										onClick={() => setEditMode(true)}
									>
										<Icons.Edit className="size-4" />
									</IconButton>
								)}
							</Flex>
						</Card>
					</Box>
				</Flex>
				<Admins store={store} />
			</Grid>
		</Form>
	);
}

const Admins = ({ store }: { store: StoreType | undefined }) => {
	const rep = useReplicache((state) => state.dashboardRep);
	const removeAdmin = React.useCallback(
		async ({ email }: { email: string }) => {
			store?.id &&
				(await rep?.mutate.removeAdmin({
					storeID: store.id,
					email,
				}));
		},
		[rep, store?.id],
	);

	return (
		<Flex
			direction={{ initial: "column", xs: "row" }}
			pb="6"
			className="border-t"
		>
			<Box width="30%" className="hidden lg:block">
				<Heading as="h2" size="5" className="font-freeman pt-4 text-accent-11">
					Admins
				</Heading>
			</Box>

			<Box width="100%" pt="4">
				<AddAdminDialog storeID={store?.id} rep={rep} />
				<Flex wrap={"wrap"} pt="4">
					{(store?.admins ?? []).map((a) => (
						<Card className="p-2 gap-2 flex max-w-xl" key={a.admin.email}>
							{a.admin.email}
							<IconButton
								variant="ghost"
								onClick={async () =>
									await removeAdmin({ email: a.admin.email })
								}
							>
								<Icons.Close />
							</IconButton>
						</Card>
					))}
				</Flex>
			</Box>
		</Flex>
	);
};
const AddAdminDialog = ({
	storeID,
	rep,
}: {
	storeID: string | undefined;
	rep: Replicache<DashboardMutatorsType> | null;
}) => {
	const [open, setOpen] = React.useState(false);
	const methods = useForm<{ email: string }>({
		resolver: zodResolver(z.object({ email: EmailSchema })),
		defaultValues: {
			email: "",
		},
	});
	const onSubmit = React.useCallback(
		async (data: { email: string }) => {
			if (storeID) {
				await rep?.mutate.addAdmin({
					email: data.email,
					storeID,
				});
				setOpen(false);
			}
		},
		[rep, storeID],
	);
	return (
		<Dialog.Root open={open} onOpenChange={setOpen}>
			<Dialog.Trigger>
				<Button variant="classic">
					<Icons.Plus /> Add Admin
				</Button>
			</Dialog.Trigger>

			<Dialog.Content maxWidth="450px">
				<form onSubmit={methods.handleSubmit(onSubmit)}>
					<Dialog.Title>Add admin</Dialog.Title>
					<Dialog.Description size="2" mb="4">
						Admin will be able to modify products and orders.
					</Dialog.Description>

					<Flex direction="column" gap="3">
						{/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
						<label>
							<Text as="div" size="2" mb="1" weight="bold">
								Email
							</Text>
							<TextField.Root
								defaultValue="freja@example.com"
								placeholder="Enter email"
								{...methods.register("email")}
							/>
						</label>
					</Flex>

					<Flex gap="3" mt="4" justify="end">
						<Dialog.Close>
							<Button variant="soft" color="gray">
								Cancel
							</Button>
						</Dialog.Close>
						<Button type="submit">Save</Button>
					</Flex>
				</form>
			</Dialog.Content>
		</Dialog.Root>
	);
};

const ImageUpload = ({ store }: { store: StoreType | undefined }) => {
	const [image, setImage] = React.useState<ImageType | null>(null);
	const [openCrop, setOpenCrop] = React.useState(false);
	const imageInputRef = React.useRef<HTMLInputElement>(null);
	const inputClick = () => {
		imageInputRef.current?.click();
	};
	const onImageChange = React.useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			if (e.target.files && e.target.files.length > 0) {
				const file = e.target.files[0]!;
				const fileReader = new FileReader();
				fileReader.onloadend = () => {
					if (fileReader.result instanceof ArrayBuffer) {
						const base64String = base64.encode(fileReader.result);
						const imageKey = generateID({ prefix: "img" });
						setImage({
							id: imageKey,
							alt: "Store image/logo",
							order: 0,
							base64: base64String,
							fileType: file.type,
						});
						setOpenCrop(true);
					}
				};
				fileReader.readAsArrayBuffer(file);
			}
		},
		[],
	);
	/* init header image */
	React.useEffect(() => {
		if (store?.image) {
			setImage(store.image);
		}
	}, [store]);
	return (
		<>
			{image && store && (
				<ImageCrop
					open={openCrop}
					setOpen={setOpenCrop}
					storeID={store.id}
					image={image}
					setImage={setImage}
					onImageChange={onImageChange}
				/>
			)}
			<Flex p="4" gap="2" className="border-b border-border">
				<input
					type="file"
					accept="image/*"
					ref={imageInputRef}
					className="hidden"
					onChange={onImageChange}
				/>
				<Avatar
					size="2"
					fallback="A"
					onClick={() => {
						if (store) {
							setImage(store.image);
							setOpenCrop(true);
						}
					}}
					src={
						store?.image?.cropped?.url ??
						toImageURL(
							store?.image?.cropped?.base64,
							store?.image?.cropped?.fileType,
						)
					}
				/>
				<Button size="2" variant="classic" onClick={inputClick}>
					Upload image
				</Button>
			</Flex>
		</>
	);
};

const ImageCrop = ({
	open,
	setOpen,
	storeID,
	image,
	setImage,
	onImageChange,
}: {
	storeID: string;
	open: boolean;
	setOpen: (val: boolean) => void;
	image: ImageType;
	setImage: React.Dispatch<React.SetStateAction<ImageType | null>>;
	onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
	const [crop, setCrop] = React.useState<Point | undefined>(undefined);
	const [zoom, setZoom] = React.useState(1);
	const [isLoading, setIsLoading] = React.useState(false);
	const dashboardRep = useReplicache((state) => state.dashboardRep);
	const imageRef = React.useRef<HTMLInputElement>(null);
	const inputClick = () => {
		imageRef.current?.click();
	};

	const [croppedArea, setCroppedArea] = React.useState<Area>({
		height: 0,
		width: 0,
		x: 0,
		y: 0,
	});

	const onSave = React.useCallback(async () => {
		setIsLoading(true);
		if (croppedArea && !image.url && image?.base64) {
			const croppedImage = await getCroppedImg(
				toImageURL(image.base64, image.fileType),
				croppedArea,
			);
			await dashboardRep?.mutate.updateStore({
				id: storeID,
				updates: {
					image,
					croppedImage,
				},
			});
		} else if (croppedArea && image.url) {
			const croppedImage = await getCroppedImg(image.url, croppedArea);
			await dashboardRep?.mutate.updateStore({
				id: storeID,
				updates: {
					croppedImage,
				},
			});
		}
		setOpen(false);
		setIsLoading(false);
	}, [croppedArea, storeID, image, setOpen, dashboardRep]);
	const onCropComplete = (_: Area, croppedPixels: Area) => {
		setCroppedArea(croppedPixels);
	};

	const deleteStoreImage = React.useCallback(async () => {
		/* if header image is a saved image from the store, delete it */
		if (image.url) {
			await dashboardRep?.mutate.deleteStoreImage({
				storeID,
				type: "store",
				url: image.url,
			});
		}
		setImage(null);
		setOpen(false);
	}, [dashboardRep, storeID, setOpen, image, setImage]);
	return (
		<Dialog.Root open={open} onOpenChange={setOpen}>
			<Dialog.Content className="md:w-[600px]">
				<div
					className={cn(
						"md:w-[600px] max-h-[500px] md:h-[500px] w-full h-[80vh] z-40",
					)}
				>
					<Cropper
						image={image.url ?? toImageURL(image.base64, image.fileType) ?? ""}
						crop={crop ?? { x: 0, y: 0 }}
						zoom={zoom}
						onCropChange={setCrop}
						classes={{ containerClassName: "h-[500px]" }}
						onZoomChange={setZoom}
						onCropComplete={onCropComplete}
						aspect={1}
					/>
				</div>

				<Flex mt="4" justify="between">
					<Flex gap="3">
						<input
							type="file"
							accept="image/*"
							ref={imageRef}
							className="hidden"
							onChange={onImageChange}
						/>
						<Button variant="surface" onClick={inputClick} disabled={isLoading}>
							{isLoading && <Spinner />}
							Choose
						</Button>
						<Button
							variant="solid"
							onClick={deleteStoreImage}
							disabled={isLoading}
						>
							{isLoading && <Spinner />}
							Delete
						</Button>
					</Flex>
					<Flex gap="3">
						<Dialog.Close>
							<Button variant="soft" color="gray" disabled={isLoading}>
								{isLoading && <Spinner />}
								Cancel
							</Button>
						</Dialog.Close>
						<Button onClick={onSave} disabled={isLoading}>
							{isLoading && <Spinner />}
							Save
						</Button>
					</Flex>
				</Flex>
			</Dialog.Content>
		</Dialog.Root>
	);
};
