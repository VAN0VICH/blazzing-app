import type { Routes } from "@blazzing-app/functions";
import { Form, FormControl, FormField, FormItem } from "@blazzing-app/ui/form";
import { Icons } from "@blazzing-app/ui/icons";
import { toast } from "@blazzing-app/ui/toast";
import { generateID } from "@blazzing-app/utils";
import { EmailSchema, type Image as ImageType } from "@blazzing-app/validators";
import type { User } from "@blazzing-app/validators/client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Avatar,
	Box,
	Button,
	Card,
	Container,
	Dialog,
	Flex,
	Grid,
	Heading,
	IconButton,
	Select,
	Spinner,
	Text,
	TextField,
	Tooltip,
} from "@radix-ui/themes";
import * as base64 from "base64-arraybuffer";
import { hc } from "hono/client";
import React from "react";
import type { Area, Point } from "react-easy-crop";
import Cropper from "react-easy-crop";
import { useForm } from "react-hook-form";
import { z } from "zod";
import ImagePlaceholder from "~/components/image-placeholder";
import { useUser } from "~/hooks/use-user";
import getCroppedImg from "~/utils/crop";
import { toImageURL } from "~/utils/helpers";
import { useReplicache } from "~/zustand/replicache";
const schema = z.object({
	fullName: z.string().optional(),
	description: z.string().optional(),
	username: z.string().optional(),
	email: EmailSchema.optional(),
	phone: z.string().optional(),
});
type UserUpdate = z.infer<typeof schema>;
export default function General() {
	const user = useUser();
	const [isLoading, setIsLoading] = React.useState(false);
	const [editMode, setEditMode] = React.useState(false);
	const methods = useForm<UserUpdate>({
		resolver: zodResolver(schema),
		defaultValues: {
			fullName: user?.fullName ?? "",
			description: user?.description ?? "",
			username: user?.username ?? "",
			email: user?.email ?? "",
			phone: user?.phone ?? "",
		},
	});
	const rep = useReplicache((state) => state.globalRep);
	const onSave = React.useCallback(
		async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
			setIsLoading(true);
			const honoClient = hc<Routes>(window.ENV.WORKER_URL);
			e.preventDefault();
			const values = methods.getValues();
			if (!user) return;
			const descriptionChanged =
				values.description && values.description !== user.description;
			const fullNameChanged =
				values.fullName && values.fullName !== user.fullName;
			const usernameChanged =
				values.username && values.username !== user.username;
			const emailChanged = values.email && values.email !== user.email;
			const phoneChanged = values.phone && values.phone !== user.phone;
			if (
				descriptionChanged ||
				fullNameChanged ||
				usernameChanged ||
				emailChanged ||
				phoneChanged
			) {
				let usernameExists = false;
				if (usernameChanged && values.username) {
					const response = await honoClient.user.username.$get({
						query: {
							username: values.username,
						},
					});
					if (response.ok) {
						const { result } = await response.json();
						if (result) {
							toast.error("Name already exists");
							usernameExists = true;
						}
					}
				}
				if (
					descriptionChanged ||
					fullNameChanged ||
					!usernameChanged ||
					emailChanged ||
					phoneChanged
				) {
					await rep?.mutate.updateUser({
						id: user.id,
						updates: {
							...(descriptionChanged && { description: values.description }),
							...(fullNameChanged && { fullName: values.fullName }),
							...(usernameChanged &&
								!usernameExists && { username: values.username }),
							...(emailChanged && { email: values.email }),
							...(phoneChanged && { phone: values.phone }),
						},
					});
				}
			}
			setIsLoading(false);
			setEditMode(false);
		},
		[user, methods.getValues, rep],
	);
	React.useEffect(() => {
		if (user) {
			methods.setValue("fullName", user.fullName ?? "");
			methods.setValue("description", user.description ?? "");
			methods.setValue("username", user.username ?? "");
			methods.setValue("email", user.email ?? "");
			methods.setValue("phone", user.phone ?? "");
		}
	}, [user, methods.setValue]);
	return (
		<Form {...methods}>
			<Container px={{ initial: "2", xs: "4" }} pb={{ initial: "9", md: "0" }}>
				<Flex py="6" direction={{ initial: "column", xs: "row" }}>
					<Box
						width={{ initial: "25%", md: "100%" }}
						my={{ initial: "4", xs: "0" }}
					>
						<Heading as="h2" size="5" className="text-accent-11 font-freeman">
							Details
						</Heading>
					</Box>
					<Box width="100%">
						<Card className="p-0">
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
							<ImageUpload user={user} />
							<Flex p="4" className="border-b border-border w-full h-[130px]">
								<Grid gap="4" className="w-full">
									<Grid gap="2">
										<Text weight="medium" size="3" className="text-accent-11">
											Full name
										</Text>
										{editMode ? (
											<FormField
												control={methods.control}
												name="fullName"
												render={({ field }) => (
													<FormItem>
														<FormControl>
															<TextField.Root
																variant="soft"
																{...field}
															/>
														</FormControl>
													</FormItem>
												)}
											/>
										) : (
											<Text size="3">{user?.fullName ?? ""}</Text>
										)}

										<Text size="2" as="p" color="gray">
											Use your first and last name as they appear on your
											government-issued ID.
										</Text>
									</Grid>
								</Grid>
							</Flex>
							<Flex
								p="4"
								className="border-b relative border-border w-full h-[90px]"
							>
								<Grid gap="2" className="w-full">
									<Text weight="medium" size="3" className="text-accent-11">
										Username
									</Text>
									{editMode ? (
										<FormField
											control={methods.control}
											name="username"
											render={({ field }) => (
												<FormItem className="w-full">
													<FormControl>
														<TextField.Root
															variant="soft"
															className="w-full"
															{...field}
														/>
													</FormControl>
												</FormItem>
											)}
										/>
									) : (
										<Text size="3">{user?.username}</Text>
									)}
								</Grid>
							</Flex>
							<Box p="4" className="border-b border-border relative h-[90px]">
								<Flex justify="between" align="center">
									<Grid gap="2" className="w-full">
										<Flex gap="2" align="center">
											<Text>Email</Text>
											<Tooltip content="Verified">
												<Icons.CircleCheck className="text-accent-11 size-4" />
											</Tooltip>
										</Flex>
										{editMode ? (
											<FormField
												control={methods.control}
												name="email"
												render={({ field }) => (
													<FormItem>
														<FormControl>
															<TextField.Root
																variant="soft"
																className="w-full"
																{...field}
															/>
														</FormControl>
													</FormItem>
												)}
											/>
										) : (
											<Text size="3">{user?.email}</Text>
										)}
									</Grid>
								</Flex>
							</Box>
							<Box p="4" className="relative h-[90px]">
								<Flex align="center" justify="between">
									<Grid gap="2">
										<Text>{"Phone number (optional)"} </Text>
										{editMode ? (
											<FormField
												control={methods.control}
												name="phone"
												render={({ field }) => (
													<FormItem>
														<FormControl>
															<TextField.Root
																variant="soft"
																className="max-w-[300px]"
																{...field}
															/>
														</FormControl>
													</FormItem>
												)}
											/>
										) : (
											<Text size="3">
												{user?.phone ?? "No phone number provided"}
											</Text>
										)}
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
						<Heading as="h2" size="5" className="text-accent-11 font-freeman">
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
						<Heading as="h2" size="5" className="text-accent-11 font-freeman">
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
						<Heading as="h2" size="5" className="text-accent-11 font-freeman">
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
		</Form>
	);
}

const ImageUpload = ({ user }: { user: User | undefined }) => {
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
							alt: `${user?.fullName ?? "User"}'s profile image`,
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
		[user],
	);
	/* init header image */
	React.useEffect(() => {
		if (user?.avatar && typeof user.avatar === "object") {
			setImage(user.avatar);
		}
	}, [user]);
	console.log("user avatar", user?.avatar);
	console.log(
		"check",
		typeof user?.avatar === "string"
			? user.avatar
			: (user?.avatar?.cropped?.url ??
					toImageURL(
						user?.avatar?.cropped?.base64,
						user?.avatar?.cropped?.fileType,
					)),
	);

	return (
		<>
			{image && user && (
				<ImageCrop
					open={openCrop}
					setOpen={setOpenCrop}
					userID={user.id}
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
					fallback={<ImagePlaceholder />}
					onClick={() => {
						if (user) {
							if (typeof user.avatar === "object") {
								setImage(user.avatar);
								setOpenCrop(true);
							}
						}
					}}
					src={
						typeof user?.avatar === "string"
							? user.avatar
							: user?.avatar?.cropped?.url
								? user.avatar.cropped.url
								: toImageURL(
										user?.avatar?.cropped?.base64,
										user?.avatar?.cropped?.fileType,
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
	userID,
	image,
	setImage,
	onImageChange,
}: {
	userID: string;
	open: boolean;
	setOpen: (val: boolean) => void;
	image: ImageType;
	setImage: React.Dispatch<React.SetStateAction<ImageType | null>>;
	onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
	const [crop, setCrop] = React.useState<Point | undefined>(undefined);
	const [zoom, setZoom] = React.useState(1);
	const [isLoading, setIsLoading] = React.useState(false);
	const rep = useReplicache((state) => state.globalRep);
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

			await rep?.mutate.updateUser({
				id: userID,
				updates: {
					avatar: image,
					croppedAvatar: croppedImage,
				},
			});
		} else if (croppedArea && image.url) {
			const croppedImage = await getCroppedImg(image.url, croppedArea);
			await rep?.mutate.updateUser({
				id: userID,
				updates: {
					croppedAvatar: croppedImage,
				},
			});
		}
		setOpen(false);
		setIsLoading(false);
	}, [croppedArea, userID, image, setOpen, rep]);
	const onCropComplete = (_: Area, croppedPixels: Area) => {
		console.log("crop", croppedPixels);
		setCroppedArea(croppedPixels);
	};

	const deleteStoreImage = React.useCallback(async () => {
		/* if header image is a saved image from the store, delete it */
		if (image.url) {
			await rep?.mutate.deleteAvatar({
				userID,
				url: image.url,
			});
		}
		setImage(null);
		setOpen(false);
	}, [rep, userID, setOpen, image, setImage]);
	return (
		<Dialog.Root open={open} onOpenChange={setOpen}>
			<Dialog.Content className="md:w-[600px]">
				<div className="md:w-[600px] max-h-[500px] md:h-[500px] w-full h-[80vh] z-40">
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
