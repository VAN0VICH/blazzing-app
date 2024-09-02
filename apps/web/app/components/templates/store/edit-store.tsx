// import { cn } from "@blazell/ui";
// import { Icons } from "@blazell/ui/icons";
// import { Input, inputVariants } from "@blazell/ui/input";
// import { Label } from "@blazell/ui/label";
// import { LoadingSpinner } from "@blazell/ui/loading";
// import { toast } from "@blazell/ui/toast";
// import { generateID } from "@blazell/utils";
// import type { Image as ImageType } from "@blazell/validators";
// import type { Store } from "@blazell/validators/client";
// import { getFormProps, getInputProps, useForm } from "@conform-to/react";
// import { getZodConstraint, parseWithZod } from "@conform-to/zod";
// import { useFetcher } from "@remix-run/react";
// import * as base64 from "base64-arraybuffer";
// import { useCallback, useEffect, useRef, useState } from "react";
// import TextareaAutosize from "react-textarea-autosize";
// import { z } from "zod";
// import { FieldErrorMessage } from "~/components/field-error";
// import Image from "~/components/molecules/image";
// import ImagePlaceholder from "~/components/molecules/image-placeholder";
// import type { Area, Point } from "~/types/crop";
// import getCroppedImg from "~/utils/crop";
// import { toImageURL } from "~/utils/helpers";
// import { useReplicache } from "~/zustand/replicache";
// import CropImage from "./crop-image";
// export type View = "default" | "cropStoreImage" | "cropHeaderImage";
// const schema = z.object({
// 	name: z.string().min(3),
// 	description: z.string().optional(),
// });
// export function EditStore({ store }: { store: Store }) {
// 	const [isLoading, setIsLoading] = useState(false);
// 	const [view, setView] = useState<
// 		"default" | "cropStoreImage" | "cropHeaderImage"
// 	>("default");
// 	const [isOpen, setIsOpen_] = useState(false);
// 	const dashboardRep = useReplicache((state) => state.dashboardRep);
// 	const [headerSrc, setHeaderSrc] = useState<string | undefined>(undefined);
// 	const [storeSrc, setStoreSrc] = useState<string | undefined>(undefined);
// 	const [storeImage, setStoreImage] = useState<ImageType | null>(null);
// 	const [headerImage, setHeaderImage] = useState<ImageType | null>(null);
// 	const [headerCrop, setHeaderCrop] = useState<Point | undefined>(undefined);
// 	const [storeCrop, setStoreCrop] = useState<Point | undefined>(undefined);
// 	const [headerCroppedArea, setHeaderCroppedArea] = useState<Area>({
// 		height: 0,
// 		width: 0,
// 		x: 0,
// 		y: 0,
// 	});
// 	const [headerCroppedAreaPixels, setHeaderCroppedAreaPixels] = useState<Area>({
// 		height: 0,
// 		width: 0,
// 		x: 0,
// 		y: 0,
// 	});
// 	const [storeCroppedAreaPixels, setStoreCroppedAreaPixels] = useState<Area>({
// 		height: 0,
// 		width: 0,
// 		x: 0,
// 		y: 0,
// 	});
// 	const [_, setStoreCroppedArea] = useState<Area>({
// 		height: 0,
// 		width: 0,
// 		x: 0,
// 		y: 0,
// 	});
// 	const headerImageInputRef = useRef<HTMLInputElement>(null);
// 	const storeImageInputRef = useRef<HTMLInputElement>(null);
// 	const fetcher = useFetcher();
// 	const [form, fields] = useForm({
// 		id: "update-store",
// 		constraint: getZodConstraint(schema),
// 		defaultValue: {
// 			name: store.name,
// 			description: store.description ?? "",
// 		},
// 		onValidate({ formData }) {
// 			return parseWithZod(formData, { schema });
// 		},

// 		onSubmit(_, { submission }) {
// 			if (submission && submission?.status === "success") {
// 				return onSubmit(submission.value);
// 			}
// 		},
// 	});
// 	const onSubmit = async (data: {
// 		name: string;
// 		description?: string | undefined;
// 	}) => {
// 		setIsLoading(true);
// 		if (data.name !== store.name) {
// 			console.log("what");
// 			const response = await fetch(`/api/stores/name/${data.name}`);
// 			const exist = await response.json();

// 			if (exist) {
// 				toast.error("Store name already exists");
// 				setIsLoading(false);
// 				return;
// 			}
// 		}
// 		saveStoreUpdates({
// 			...(data.description && { description: data.description }),
// 			...(data.name !== store.name && data.name && { name: data.name }),
// 		});
// 		toast.success("Store updated successfully.");
// 		setIsLoading(false);
// 		form.reset();
// 		setIsOpen(false);
// 	};

// 	const clear = useCallback(() => {
// 		if (headerCrop) setHeaderCrop(undefined);
// 		if (storeCrop) setStoreCrop(undefined);
// 		if (setView) setView("default");
// 	}, [headerCrop, storeCrop]);
// 	const setIsOpen = (value: boolean) => {
// 		if (!value) {
// 			clear();

// 			setIsOpen_(value);
// 		} else {
// 			setIsOpen_(value);
// 		}
// 	};
// 	const headerInputClick = () => {
// 		headerImageInputRef.current?.click();
// 	};
// 	const storeInputClick = () => {
// 		storeImageInputRef.current?.click();
// 	};
// 	const onHeaderCropComplete = (cropped: Area, croppedPixels: Area) => {
// 		setHeaderCroppedArea(cropped);
// 		setHeaderCroppedAreaPixels(croppedPixels);
// 	};
// 	const onStoreCropComplete = (cropped: Area, croppedPixels: Area) => {
// 		setStoreCroppedArea(cropped);
// 		setStoreCroppedAreaPixels(croppedPixels);
// 	};

// 	const onHeaderImageChange = useCallback(
// 		(e: React.ChangeEvent<HTMLInputElement>) => {
// 			if (e.target.files && e.target.files.length > 0) {
// 				const file = e.target.files[0]!;
// 				const fileReader = new FileReader();
// 				fileReader.onloadend = () => {
// 					if (fileReader.result instanceof ArrayBuffer) {
// 						const base64String = base64.encode(fileReader.result);
// 						const imageKey = generateID({ prefix: "img" });
// 						setHeaderImage({
// 							id: imageKey,
// 							name: file.name,
// 							order: 0,
// 							uploaded: false,
// 							url: "",
// 							base64: base64String,
// 							fileType: file.type,
// 						});
// 						setHeaderSrc(toImageURL(base64String, file.type));
// 						setView("cropHeaderImage");
// 					}
// 				};
// 				fileReader.readAsArrayBuffer(file);
// 			}
// 		},
// 		[],
// 	);
// 	const onStoreImageChange = useCallback(
// 		(e: React.ChangeEvent<HTMLInputElement>) => {
// 			if (e.target.files && e.target.files.length > 0) {
// 				const file = e.target.files[0]!;
// 				const fileReader = new FileReader();
// 				fileReader.onloadend = () => {
// 					if (fileReader.result instanceof ArrayBuffer) {
// 						const base64String = base64.encode(fileReader.result);
// 						const imageKey = generateID({ prefix: "img" });
// 						setStoreImage({
// 							id: imageKey,
// 							name: file.name,
// 							order: 0,
// 							uploaded: false,
// 							url: "",
// 							base64: base64String,
// 							fileType: file.type,
// 						});
// 						setStoreSrc(toImageURL(base64String, file.type));
// 						setView("cropStoreImage");
// 					}
// 				};
// 				fileReader.readAsArrayBuffer(file);
// 			}
// 		},
// 		[],
// 	);
// 	const saveStoreUpdates = useCallback(
// 		async ({ description, name }: { description?: string; name?: string }) => {
// 			setIsLoading(true);

// 			await dashboardRep?.mutate.updateStore({
// 				id: store.id,
// 				updates: {
// 					...(name && name !== store.name && { name }),
// 					...(description &&
// 						description !== store.description && { description }),
// 					/* if there is a new store image, update it */
// 					...(storeSrc &&
// 						storeSrc !== store.storeImage?.url &&
// 						storeImage && {
// 							storeImage,
// 						}),
// 					/* if there is new crop, but image is the same, update crop */
// 					...(storeCrop &&
// 						storeSrc && {
// 							storeCroppedImage: await getCroppedImg(
// 								storeSrc,
// 								storeCroppedAreaPixels,
// 							),
// 						}),
// 					/* if there is a new header image, update it */
// 					...(headerSrc &&
// 						headerSrc !== store.headerImage?.url &&
// 						headerImage && {
// 							headerImage,
// 						}),
// 					/* if there is new crop, but image is the same, update crop */
// 					...(headerCrop &&
// 						headerSrc && {
// 							headerCroppedImage: await getCroppedImg(
// 								headerSrc,
// 								headerCroppedAreaPixels,
// 							),
// 						}),
// 				},
// 			});
// 			setIsLoading(false);
// 		},
// 		[
// 			dashboardRep,
// 			headerImage,
// 			storeImage,
// 			store,
// 			headerCroppedAreaPixels,
// 			storeCroppedAreaPixels,
// 			headerSrc,
// 			storeSrc,
// 			headerCrop,
// 			storeCrop,
// 		],
// 	);

// 	const deleteStoreImage = useCallback(async () => {
// 		/* if header image is a saved image from the store, delete it */
// 		if (headerSrc === store.headerImage?.url) {
// 			store?.headerImage &&
// 				(await Promise.all([
// 					dashboardRep?.mutate.deleteStoreImage({
// 						storeID: store.id,
// 						type: "header",
// 						url: store.headerImage.url,
// 					}),
// 					store.headerImage?.croppedImage?.url
// 						? dashboardRep?.mutate.deleteStoreImage({
// 								storeID: store.id,
// 								type: "header",
// 								url: store.headerImage.croppedImage.url,
// 							})
// 						: Promise.resolve(null),
// 				]));
// 			setHeaderSrc(undefined);
// 		} else {
// 			/* if header image is a new image, remove it or replace it with old image */
// 			headerSrc && setHeaderSrc(store.headerImage?.url);
// 		}
// 	}, [store, dashboardRep, headerSrc]);

// 	/* init header image */
// 	useEffect(() => {
// 		if (!headerSrc && store?.headerImage?.url) {
// 			setHeaderSrc(store.headerImage.url);
// 		}
// 	}, [store, headerSrc]);

// 	/* init store image */
// 	useEffect(() => {
// 		if (!storeSrc && store?.storeImage?.url) {
// 			setStoreSrc(store.storeImage.url);
// 		}
// 	}, [store, storeSrc]);

// 	return (
// 		<Dialog open={isOpen} onOpenChange={setIsOpen}>
// 			<DialogTrigger asChild>
// 				<Button variant="ghost" className="mt-2">
// 					Edit store
// 				</Button>
// 			</DialogTrigger>
// 			<DialogContent className="md:w-[600px] bg-slate-2 p-0 gap-0">
// 				<span className="flex w-full justify-center p-4 border-border  ">
// 					<div>
// 						{view !== "default" && (
// 							<Button
// 								className="absolute top-3 left-3"
// 								variant="ghost"
// 								onClick={() => setView("default")}
// 							>
// 								Back
// 								<Icons.Left size={20} />
// 							</Button>
// 						)}
// 						<div className="absolute top-3 left-3 flex gap-2">
// 							{view === "default" &&
// 								storeSrc &&
// 								!storeSrc.startsWith("http") && (
// 									<Button
// 										className="text-slate-11"
// 										variant="ghost"
// 										onClick={() => setView("cropStoreImage")}
// 									>
// 										store
// 										<Icons.Right size={20} />
// 									</Button>
// 								)}
// 							{view === "default" &&
// 								headerSrc &&
// 								!headerSrc.startsWith("http") && (
// 									<Button
// 										className="text-slate-11"
// 										variant="ghost"
// 										onClick={() => setView("cropHeaderImage")}
// 									>
// 										header
// 										<Icons.Right size={20} />
// 									</Button>
// 								)}
// 						</div>
// 					</div>
// 					<DialogTitle className="text-2xl">Edit store</DialogTitle>
// 					<Button
// 						type="button"
// 						variant={"ghost"}
// 						size="icon"
// 						className="text-slate-11 absolute top-3 right-3"
// 						onClick={() => setIsOpen(false)}
// 					>
// 						<Icons.Close />
// 					</Button>
// 				</span>
// 				<div className="w-full relative">
// 					{view === "cropHeaderImage" && headerSrc && (
// 						<CropImage
// 							src={headerSrc}
// 							crop={headerCrop}
// 							onCropComplete={onHeaderCropComplete}
// 							setCrop={setHeaderCrop}
// 							setCroppedArea={setHeaderCroppedArea}
// 							type="header"
// 						/>
// 					)}
// 					{view === "cropStoreImage" && storeSrc && (
// 						<CropImage
// 							src={storeSrc ?? null}
// 							crop={storeCrop}
// 							onCropComplete={onStoreCropComplete}
// 							setCrop={setStoreCrop}
// 							setCroppedArea={setStoreCroppedArea}
// 							type="store"
// 						/>
// 					)}

// 					<div
// 						className={cn("relative w-full h-[14rem]", {
// 							hidden: view !== "default",
// 						})}
// 					>
// 						<input
// 							type="file"
// 							accept="image/*"
// 							ref={storeImageInputRef}
// 							className="hidden"
// 							onChange={onStoreImageChange}
// 						/>
// 						<Avatar
// 							className="border-border bg-slate-3 hover:brightness-90 z-20 absolute  left-4 bottom-0 border aspect-square w-full h-full max-w-32 max-h-32 min-w-32 min-h-32 cursor-pointer"
// 							onClick={storeInputClick}
// 							onKeyDown={(e) => {
// 								if (e.key === "Enter" || e.key === " ") {
// 									e.preventDefault();
// 									e.stopPropagation();
// 									storeInputClick();
// 								}
// 							}}
// 						>
// 							<Image
// 								src={storeSrc}
// 								fit="contain"
// 								className="w-[130px]"
// 								width={200}
// 								quality={100}
// 							/>
// 						</Avatar>
// 						<div
// 							className={cn(
// 								"w-full h-[160px] bg-slate-5 relative border-y border-border   flex justify-center items-center overflow-hidden",
// 							)}
// 						>
// 							{headerCrop && headerCroppedArea && headerSrc && (
// 								<Output croppedArea={headerCroppedArea} src={headerSrc} />
// 							)}
// 							{!headerCrop && (
// 								<Image
// 									src={store.headerImage?.croppedImage?.url}
// 									fit="contain"
// 								/>
// 							)}
// 							<input
// 								type="file"
// 								accept="image/*"
// 								ref={headerImageInputRef}
// 								className="hidden"
// 								onChange={onHeaderImageChange}
// 							/>
// 							<Avatar
// 								className="h-16 w-16 cursor-pointer absolute border-border bg-slate-3 hover:brightness-90"
// 								onClick={headerInputClick}
// 								onKeyDown={(e) => {
// 									if (e.key === "Enter" || e.key === " ") {
// 										e.preventDefault();
// 										e.stopPropagation();
// 										headerInputClick();
// 									}
// 								}}
// 							>
// 								<ImagePlaceholder />
// 							</Avatar>
// 							{headerSrc && (
// 								<Button
// 									className="rounded-full absolute top-2 right-2 bg-slate-a-3 hover:bg-slate-a-6 border-none"
// 									size={"icon"}
// 									variant={"ghost"}
// 									onClick={deleteStoreImage}
// 								>
// 									<Icons.Close className="text-slate-11" />
// 								</Button>
// 							)}
// 						</div>
// 					</div>
// 				</div>
// 				{view === "default" && (
// 					<fetcher.Form
// 						className="p-4 flex flex-col gap-2"
// 						{...getFormProps(form)}
// 					>
// 						<span>
// 							<Label className="text-slate-11 py-2">Name</Label>
// 							<Input
// 								className="w-full md:w-40"
// 								{...getInputProps(fields.name, { type: "text" })}
// 								defaultValue={store.name}
// 							/>
// 							<FieldErrorMessage message={fields.name?.errors?.[0]} />
// 						</span>
// 						<span>
// 							<Label className="text-slate-11 py-2">Description</Label>
// 							<TextareaAutosize
// 								className={cn("", inputVariants())}
// 								maxRows={10}
// 								{...getInputProps(fields.description, { type: "text" })}
// 								defaultValue={store.description ?? ""}
// 							/>
// 						</span>

// 						<div className="flex justify-center">
// 							<Button disabled={isLoading} type="submit">
// 								{isLoading && (
// 									<LoadingSpinner className="text-white size-4 mr-2" />
// 								)}
// 								Save
// 							</Button>
// 						</div>
// 					</fetcher.Form>
// 				)}
// 			</DialogContent>
// 		</Dialog>
// 	);
// }
// function Output({ croppedArea, src }: { croppedArea: Area; src: string }) {
// 	const scale = 100 / croppedArea.width;
// 	const transform = {
// 		x: `${-croppedArea.x * scale}%`,
// 		y: `${-croppedArea.y * scale}%`,
// 		scale,
// 		width: "calc(100% + 0.5px)",
// 		height: "auto",
// 	};

// 	const imageStyle = {
// 		transform: `translate3d(${transform.x}, ${transform.y}, 0) scale3d(${transform.scale},${transform.scale},1)`,
// 		width: transform.width,
// 		height: transform.height,
// 	};

// 	return (
// 		<div className="overflow-hidden h-[160px] relative">
// 			<Image src={src} alt="" fit="cover" style={imageStyle} />
// 		</div>
// 	);
// }
