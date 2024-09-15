import { cn } from "@blazzing-app/ui";
import { Icons } from "@blazzing-app/ui/icons";
import { toast } from "@blazzing-app/ui/toast";
import { generateID } from "@blazzing-app/utils";
import type { Image as ImageType } from "@blazzing-app/validators";
import type { Store } from "@blazzing-app/validators/client";
import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import {
	Avatar,
	Box,
	Button,
	Dialog,
	Flex,
	Grid,
	IconButton,
	Spinner,
	Text,
	TextArea,
	TextField,
} from "@radix-ui/themes";
import { useFetcher } from "@remix-run/react";
import * as base64 from "base64-arraybuffer";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { z } from "zod";
import type { Area, Point } from "~/types/crop";
import { toImageURL } from "~/utils/helpers";
import CropImage from "./crop-image";
import { Noise } from "@blazzing-app/ui/noise";
export type View = "default" | "cropStoreImage" | "cropHeaderImage";
const schema = z.object({
	name: z.string().min(3),
	description: z.string().optional(),
});
export function EditStore({ store }: { store: Store }) {
	const [isLoading, setIsLoading] = useState(false);
	const [view, setView] = useState<
		"default" | "cropStoreImage" | "cropHeaderImage"
	>("default");
	const [isOpen, setIsOpen_] = useState(false);
	const [headerSrc, setHeaderSrc] = useState<string | undefined>(undefined);
	const [storeSrc, setStoreSrc] = useState<string | undefined>(undefined);
	const [____, setStoreImage] = useState<ImageType | null>(null);
	const [_____, setHeaderImage] = useState<ImageType | null>(null);
	const [headerCrop, setHeaderCrop] = useState<Point | undefined>(undefined);
	const [storeCrop, setStoreCrop] = useState<Point | undefined>(undefined);
	const [headerCroppedArea, setHeaderCroppedArea] = useState<Area>({
		height: 0,
		width: 0,
		x: 0,
		y: 0,
	});
	const [_, setHeaderCroppedAreaPixels] = useState<Area>({
		height: 0,
		width: 0,
		x: 0,
		y: 0,
	});
	const [__, setStoreCroppedAreaPixels] = useState<Area>({
		height: 0,
		width: 0,
		x: 0,
		y: 0,
	});
	const [___, setStoreCroppedArea] = useState<Area>({
		height: 0,
		width: 0,
		x: 0,
		y: 0,
	});
	const headerImageInputRef = useRef<HTMLInputElement>(null);
	const storeImageInputRef = useRef<HTMLInputElement>(null);
	const fetcher = useFetcher();
	const [form, fields] = useForm({
		id: "update-store",
		constraint: getZodConstraint(schema),
		defaultValue: {
			name: store.name,
			description: store.description ?? "",
		},
		onValidate({ formData }) {
			return parseWithZod(formData, { schema });
		},

		onSubmit(_, { submission }) {
			if (submission && submission?.status === "success") {
				return onSubmit(submission.value);
			}
		},
	});
	const onSubmit = async (data: {
		name: string;
		description?: string | undefined;
	}) => {
		setIsLoading(true);
		if (data.name !== store.name) {
			const response = await fetch(`/api/stores/name/${data.name}`);
			const exist = await response.json();

			if (exist) {
				toast.error("Store name already exists");
				setIsLoading(false);
				return;
			}
		}
		toast.success("Store updated successfully.");
		setIsLoading(false);
		form.reset();
		setIsOpen(false);
	};

	const clear = useCallback(() => {
		if (headerCrop) setHeaderCrop(undefined);
		if (storeCrop) setStoreCrop(undefined);
		if (setView) setView("default");
	}, [headerCrop, storeCrop]);
	const setIsOpen = (value: boolean) => {
		if (!value) {
			clear();

			setIsOpen_(value);
		} else {
			setIsOpen_(value);
		}
	};
	const headerInputClick = () => {
		headerImageInputRef.current?.click();
	};
	const storeInputClick = () => {
		storeImageInputRef.current?.click();
	};
	const onHeaderCropComplete = (cropped: Area, croppedPixels: Area) => {
		setHeaderCroppedArea(cropped);
		setHeaderCroppedAreaPixels(croppedPixels);
	};
	const onStoreCropComplete = (cropped: Area, croppedPixels: Area) => {
		setStoreCroppedArea(cropped);
		setStoreCroppedAreaPixels(croppedPixels);
	};

	const onHeaderImageChange = useCallback(
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
							fileType: file.type,
							base64: base64String,
						});
						setHeaderSrc(toImageURL(base64String, file.type));
						setView("cropHeaderImage");
					}
				};
				fileReader.readAsArrayBuffer(file);
			}
		},
		[],
	);
	const onStoreImageChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			if (e.target.files && e.target.files.length > 0) {
				const file = e.target.files[0]!;
				const fileReader = new FileReader();
				fileReader.onloadend = () => {
					if (fileReader.result instanceof ArrayBuffer) {
						const base64String = base64.encode(fileReader.result);
						const imageKey = generateID({ prefix: "img" });
						setStoreImage({
							id: imageKey,
							order: 0,
							base64: base64String,
							fileType: file.type,
							alt: "store image",
						});
						setStoreSrc(toImageURL(base64String, file.type));
						setView("cropStoreImage");
					}
				};
				fileReader.readAsArrayBuffer(file);
			}
		},
		[],
	);

	/* init header image */
	useEffect(() => {
		if (!headerSrc && store?.headerImage?.url) {
			setHeaderSrc(store.headerImage.url);
		}
	}, [store, headerSrc]);

	/* init store image */
	useEffect(() => {
		if (!storeSrc && store?.image?.url) {
			setStoreSrc(store.image.url);
		}
	}, [store, storeSrc]);

	return (
		<Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
			<Dialog.Trigger>
				<Button variant="outline" className="mt-2">
					Edit store
				</Button>
			</Dialog.Trigger>
			<Dialog.Content className="md:w-[600px] backdrop-blur-md bg-white dark:bg-component p-0 gap-0">
				<Flex justify="center" p="4">
					<Box>
						{view !== "default" && (
							<Button
								className="absolute top-3 left-3"
								variant="ghost"
								onClick={() => setView("default")}
							>
								Back
								<Icons.Left size={20} />
							</Button>
						)}
						<div className="absolute top-3 left-3 flex gap-2">
							{view === "default" &&
								storeSrc &&
								!storeSrc.startsWith("http") && (
									<Button
										className="text- gray-11"
										variant="ghost"
										onClick={() => setView("cropStoreImage")}
									>
										store
										<Icons.Right size={20} />
									</Button>
								)}
							{view === "default" &&
								headerSrc &&
								!headerSrc.startsWith("http") && (
									<Button
										className="text- gray-11"
										variant="ghost"
										onClick={() => setView("cropHeaderImage")}
									>
										header
										<Icons.Right size={20} />
									</Button>
								)}
						</div>
					</Box>
					<Dialog.Title className="text-2xl">Edit store</Dialog.Title>
					<IconButton
						variant={"ghost"}
						className="absolute top-3 right-3"
						onClick={() => setIsOpen(false)}
					>
						<Icons.Close />
					</IconButton>
				</Flex>
				<div className="w-full relative">
					{view === "cropHeaderImage" && headerSrc && (
						<CropImage
							src={headerSrc}
							crop={headerCrop}
							onCropComplete={onHeaderCropComplete}
							setCrop={setHeaderCrop}
							setCroppedArea={setHeaderCroppedArea}
							type="header"
						/>
					)}
					{view === "cropStoreImage" && storeSrc && (
						<CropImage
							src={storeSrc ?? null}
							crop={storeCrop}
							onCropComplete={onStoreCropComplete}
							setCrop={setStoreCrop}
							setCroppedArea={setStoreCroppedArea}
							type="store"
						/>
					)}

					<div
						className={cn("relative w-full h-[14rem]", {
							hidden: view !== "default",
						})}
					>
						<input
							type="file"
							accept="image/*"
							ref={storeImageInputRef}
							className="hidden"
							onChange={onStoreImageChange}
						/>
						<Avatar
							className="border-border hover:brightness-90 z-20 absolute  left-4 bottom-0 border aspect-square w-full h-full max-w-32 max-h-32 min-w-32 min-h-32 cursor-pointer"
							onClick={storeInputClick}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ") {
									e.preventDefault();
									e.stopPropagation();
									storeInputClick();
								}
							}}
							fallback="A"
						/>
						<div
							className={cn(
								"w-full h-[160px] bg-accent-3 relative border-y border-border   flex justify-center items-center overflow-hidden",
							)}
						>
							{!headerCrop && <Noise />}
							{headerCrop && headerCroppedArea && headerSrc && (
								<Output croppedArea={headerCroppedArea} src={headerSrc} />
							)}
							<input
								type="file"
								accept="image/*"
								ref={headerImageInputRef}
								className="hidden"
								onChange={onHeaderImageChange}
							/>
							<Avatar
								fallback="G"
								className="h-16 w-16 cursor-pointer border absolute border-border hover:brightness-90"
								onClick={headerInputClick}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										e.preventDefault();
										e.stopPropagation();
										headerInputClick();
									}
								}}
							/>
							{headerSrc && (
								<IconButton
									className="rounded-full absolute top-2 right-2 border-none"
									variant={"ghost"}
								>
									<Icons.Close />
								</IconButton>
							)}
						</div>
					</div>
				</div>
				{view === "default" && (
					<fetcher.Form
						className="p-4 flex flex-col gap-2"
						{...getFormProps(form)}
					>
						<Grid gap="2">
							<Text size="2">Name</Text>
							<TextField.Root
								className="w-full md:w-40"
								size="2"
								variant="soft"
								{...getInputProps(fields.name, { type: "text" })}
							/>
							<Text>{fields.name?.errors?.[0]}</Text>
						</Grid>
						<Grid gap="2">
							<Text size="2">Description</Text>
							<TextArea
								size="2"
								variant="soft"
								{...getInputProps(fields.description, { type: "text" })}
								defaultValue={store.description ?? ""}
							/>
						</Grid>

						<Flex justify="center" pt="2">
							<Button
								size="3"
								disabled={isLoading}
								variant="classic"
								type="submit"
							>
								{isLoading && <Spinner />}
								Save
							</Button>
						</Flex>
					</fetcher.Form>
				)}
			</Dialog.Content>
		</Dialog.Root>
	);
}
function Output({ croppedArea, src }: { croppedArea: Area; src: string }) {
	const scale = 100 / croppedArea.width;
	const transform = {
		x: `${-croppedArea.x * scale}%`,
		y: `${-croppedArea.y * scale}%`,
		scale,
		width: "calc(100% + 0.5px)",
		height: "auto",
	};

	const imageStyle = {
		transform: `translate3d(${transform.x}, ${transform.y}, 0) scale3d(${transform.scale},${transform.scale},1)`,
		width: transform.width,
		height: transform.height,
	};

	return (
		<div className="overflow-hidden h-[160px] relative">
			<img src={src} alt="" style={imageStyle} />
		</div>
	);
}
