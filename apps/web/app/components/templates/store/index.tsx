import { cn } from "@blazzing-app/ui";
import { Icons } from "@blazzing-app/ui/icons";
import { Noise } from "@blazzing-app/ui/noise";
import { generateID } from "@blazzing-app/utils";
import type {
	Image as ImageType,
	Product,
	Store,
	StoreProduct,
} from "@blazzing-app/validators";

import {
	Box,
	Button,
	Dialog,
	Flex,
	Grid,
	IconButton,
	Skeleton,
	Spinner,
	Tabs,
	Text,
} from "@radix-ui/themes";
import * as base64 from "base64-arraybuffer";
import React from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";
import Image from "~/components/image";
import getCroppedImg from "~/utils/crop";
import { toImageURL } from "~/utils/helpers";
import { useReplicache } from "~/zustand/replicache";
import { Products } from "../product/products";
import { StoreInfo } from "./store-info";
const ASPECT_RATIO = 3 / 1;

export function StoreComponent({
	store,
	isInitialized,
	products,
	isDashboard = false,
	storeURL,
}: {
	store: Store | undefined;
	isInitialized: boolean;
	products: (Product | StoreProduct)[];
	isDashboard?: boolean;
	storeURL?: string;
}) {
	const [headerImage, setHeaderImage] = React.useState<ImageType | null>(null);
	const [openCrop, setOpenCrop] = React.useState(false);
	const headerImageInputRef = React.useRef<HTMLInputElement>(null);
	const headerInputClick = () => {
		headerImageInputRef.current?.click();
	};
	const onHeaderImageChange = React.useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			if (e.target.files && e.target.files.length > 0) {
				const file = e.target.files[0]!;
				const fileReader = new FileReader();
				fileReader.onloadend = () => {
					if (fileReader.result instanceof ArrayBuffer) {
						const base64String = base64.encode(fileReader.result);
						const imageKey = generateID({ prefix: "img" });
						setHeaderImage({
							id: imageKey,
							alt: "header image",
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
	React.useEffect(() => {
		if (store?.headerImage) {
			setHeaderImage(store.headerImage);
		}
	}, [store?.headerImage]);

	return (
		<>
			{headerImage && store && isDashboard && (
				<HeaderImageCrop
					setImage={setHeaderImage}
					open={openCrop}
					setOpen={setOpenCrop}
					storeID={store.id}
					image={headerImage}
					onImageChange={onHeaderImageChange}
				/>
			)}
			<Box position="relative" width="100%" maxWidth="1700px">
				<Grid position="relative" pb="4">
					{!isInitialized && (
						<Skeleton
							height="10rem"
							width="100%"
							className="lg:h-[200px] md:h-[180px] h-[150px]"
						/>
					)}
					{!store?.headerImage && isInitialized && (
						<Box className="lg:h-[200px] relative md:h-[180px] h-[150px] w-full bg-accent-4 rounded-[7px] ">
							<Noise />
							<input
								type="file"
								accept="image/*"
								ref={headerImageInputRef}
								className="hidden"
								onChange={onHeaderImageChange}
							/>
							<IconButton
								variant="ghost"
								size="4"
								className="absolute border-dashed border-accent-9 border top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
								onClick={headerInputClick}
							>
								<Icons.Upload className="size-5" />
							</IconButton>
						</Box>
					)}
					{(store?.headerImage?.cropped?.url ||
						store?.headerImage?.cropped?.base64) &&
						isInitialized && (
							<Box
								className={cn(
									"lg:h-[200px] overflow-hidden relative md:h-[180px] h-[150px] w-full border border-border rounded-[7px] ",
									{
										"cursor-pointer": isDashboard,
									},
								)}
								onClick={() => {
									if (isDashboard) {
										setHeaderImage(store.headerImage);
										setOpenCrop(true);
									}
								}}
							>
								<Image
									src={
										store?.headerImage?.cropped?.url ??
										toImageURL(
											store?.headerImage?.cropped?.base64,
											store?.headerImage?.cropped?.fileType,
										)
									}
									quality={95}
									fit="cover"
									className="max-h-[200px] z-10 h-[150px] md:h-[180px] lg:h-[200px] object-cover w-full"
									height={{ initial: 150, sm: 180, lg: 200 }}
								/>
							</Box>
						)}
				</Grid>

				<StoreInfo
					isDashboard={isDashboard}
					store={store}
					isInitialized={isInitialized}
					{...(storeURL && { storeURL })}
				/>
				<Tabs.Root defaultValue="products" className="pt-3">
					<Tabs.List>
						<Tabs.Trigger value="products">Products</Tabs.Trigger>
						<Tabs.Trigger value="announcements">Announcements</Tabs.Trigger>
					</Tabs.List>

					<Box pt="3">
						<Tabs.Content value="products">
							<Products
								isDashboard={isDashboard}
								products={products}
								isInitialized={isInitialized}
							/>
						</Tabs.Content>

						<Tabs.Content value="announcements">
							<Text size="2">No notifications.</Text>
						</Tabs.Content>
					</Box>
				</Tabs.Root>
			</Box>
		</>
	);
}

const HeaderImageCrop = ({
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
					headerImage: image,
					croppedHeaderImage: croppedImage,
				},
			});
		} else if (croppedArea && image.url) {
			const croppedImage = await getCroppedImg(image.url, croppedArea);
			await dashboardRep?.mutate.updateStore({
				id: storeID,
				updates: {
					croppedHeaderImage: croppedImage,
				},
			});
		}
		setOpen(false);
		setIsLoading(false);
	}, [croppedArea, storeID, setOpen, dashboardRep, image]);

	const onCropComplete = (_: Area, croppedPixels: Area) => {
		console.log("crop", croppedPixels);
		setCroppedArea(croppedPixels);
	};

	const deleteStoreImage = React.useCallback(async () => {
		/* if header image is a saved image from the store, delete it */
		if (image.url) {
			await dashboardRep?.mutate.deleteStoreImage({
				storeID,
				type: "header",
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
						aspect={ASPECT_RATIO}
						crop={crop ?? { x: 0, y: 0 }}
						zoom={zoom}
						onCropChange={setCrop}
						classes={{ containerClassName: "h-[500px]" }}
						onZoomChange={setZoom}
						onCropComplete={onCropComplete}
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
