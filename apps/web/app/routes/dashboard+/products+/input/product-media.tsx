import { cn } from "@blazzing-app/ui";
import { Icons } from "@blazzing-app/ui/icons";
import { Sortable, SortableItem } from "@blazzing-app/ui/sortable";
import type { Image as ImageType } from "@blazzing-app/validators";
import { closestCorners, DndContext } from "@dnd-kit/core";
import {
	Box,
	Button,
	Card,
	Checkbox,
	Flex,
	Grid,
	Heading,
	Kbd,
	Spinner,
	Tooltip,
} from "@radix-ui/themes";
import React from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { FileUpload } from "~/components/file-upload";
import Image from "~/components/image";
import { toImageURL } from "~/utils/helpers";
import { useReplicache } from "~/zustand/replicache";

export function Media({
	images,
	variantID,
	className,
}: Readonly<{
	images: ImageType[] | undefined;
	variantID: string | undefined;
	className?: string;
}>) {
	const dashboardRep = useReplicache((state) => state.dashboardRep);
	const [imagesState, setImagesState] = React.useState(images ?? []);
	const [selectedImages, setSelectedImages] = React.useState<ImageType[]>([]);

	React.useEffect(() => {
		if (images) setImagesState(images);
	}, [images]);

	const uploadImages = React.useCallback(
		async (images: ImageType[]) => {
			variantID &&
				(await dashboardRep?.mutate.uploadImages({
					images,
					entityID: variantID,
				}));
		},
		[dashboardRep, variantID],
	);
	const deleteImage = React.useCallback(
		async (keys: string[], urls: string[]) => {
			variantID &&
				(await dashboardRep?.mutate.deleteImage({
					keys,
					entityID: variantID,
					urls,
				}));
			setSelectedImages([]);
		},
		[variantID, dashboardRep],
	);
	useHotkeys(["D"], async () => {
		await deleteImage(
			selectedImages.map((i) => i.id),
			selectedImages.map((i) => i.url).filter((i) => i !== undefined),
		);
	});

	const updateImagesOrder = React.useCallback(
		async ({
			order,
		}: {
			order: Record<string, number>;
		}) => {
			if (variantID && dashboardRep)
				await dashboardRep.mutate.updateImagesOrder({
					order,
					entityID: variantID,
				});
		},
		[dashboardRep, variantID],
	);

	return (
		<>
			{selectedImages.length > 0 && (
				<FloatingBar
					deleteImage={deleteImage}
					selectedImages={selectedImages}
				/>
			)}

			<Card className={cn("overflow-hidden p-0", className)}>
				<Flex
					justify="between"
					align="center"
					className="border-b border-border"
					p="4"
				>
					<Heading size="3" className="text-accent-11">
						Media
					</Heading>
				</Flex>
				<FileUpload
					onFilesChange={uploadImages}
					files={images}
					maxFiles={8}
					maxSize={10 * 1024 * 1024}
				/>
				<DndContext>
					{images && images.length > 0 && (
						<Box position="relative" p="4">
							<Grid
								columns={{ initial: "2", xs: "3", sm: "4", md: "5" }}
								gap="4"
							>
								{images.map((img) => (
									<Box
										key={img.id}
										className={cn(
											"group bg-gray-2 border border-border shadow-inner rounded-[5px] aspect-square relative min-w-[120px] min-h-[120px]",
										)}
									/>
								))}
							</Grid>

							<Sortable
								orientation="mixed"
								collisionDetection={closestCorners}
								value={imagesState}
								onValueChange={(items) => {
									const order: Record<string, number> = {};

									items.forEach((item, index) => {
										order[item.id] = index;
									});
									setImagesState(items);
									updateImagesOrder({ order }).catch((err) => console.log(err));
								}}
							>
								<Grid
									columns={{ initial: "2", xs: "3", sm: "4", md: "5" }}
									gap="4"
									position="absolute"
									inset="4"
								>
									{images.map((image, index) => {
										const selected = selectedImages.some(
											(i) => i.id === image.id,
										);
										return (
											<SortableItem
												value={image.id}
												asTrigger
												asChild
												key={image.id}
												disableDragOn=".checkbox-class"
												tabIndex={0}
												className="focus-visible:ring-1 focus-visible:ring-ring rounded-[5px]"
												onKeyDown={(e) => {
													if (e.key === "Enter" || e.key === " ") {
														e.preventDefault();
														if (selected) {
															setSelectedImages(
																selectedImages.filter((i) => i.id !== image.id),
															);
														} else {
															setSelectedImages([...selectedImages, image]);
														}
													}
												}}
											>
												<div
													className={cn(
														"group relative min-w-[120px] min-h-[120px]",
														{ "border border-accent-9": selected },
													)}
												>
													{index === 0 && (
														<Tooltip content="Thumbnail" delayDuration={250}>
															<Flex
																justify="center"
																align="center"
																position="absolute"
																left="2"
																top="2"
																className="rounded-full bg-accent-9"
															>
																<Icons.Thumbnail
																	className="text-white"
																	size={11}
																/>
															</Flex>
														</Tooltip>
													)}

													<Box position="relative">
														<Image
															src={
																image.url ??
																toImageURL(image.base64, image.fileType)
															}
															alt={image.alt ?? "Uploaded image"}
															fit="cover"
															width={{ initial: 200 }}
															height={{ initial: 200 }}
															quality={90}
															className={cn(
																"border aspect-square border-border w-full h-full object-contain rounded-[5px]",
																{
																	"brightness-75": !image.url,
																},
															)}
														/>
														{!image.url && (
															<div className="absolute inset-0 flex items-center justify-center">
																<Spinner />
															</div>
														)}
													</Box>
													<Checkbox
														checked={selectedImages.some(
															(i) => i.id === image.id,
														)}
														onCheckedChange={(value) => {
															if (value) {
																setSelectedImages([...selectedImages, image]);
															} else {
																setSelectedImages(
																	selectedImages.filter(
																		(i) => i.id !== image.id,
																	),
																);
															}
														}}
														size="3"
														tabIndex={-1}
														className={cn(
															"hidden group-hover:block absolute right-2 top-2 checkbox-class bg-gray-2",
															{
																block: selected,
															},
														)}
													/>
												</div>
											</SortableItem>
										);
									})}
								</Grid>
							</Sortable>
						</Box>
					)}
				</DndContext>
			</Card>
		</>
	);
}

const FloatingBar = ({
	selectedImages,
	deleteImage,
}: {
	selectedImages: ImageType[];
	deleteImage: (keys: string[], urls: string[]) => Promise<void>;
}) => {
	return (
		<Flex className="fixed left-1/2 -translate-x-1/2 bottom-20 lg:bottom-10 rounded-[7px] z-30 w-fit">
			<Box className="w-full overflow-x-auto">
				<Card className="flex items-center gap-6 shadow-2xl px-4">
					<Tooltip content="Delete" delayDuration={250}>
						<Button
							variant="ghost"
							size="3"
							onClick={async (e) => {
								e.preventDefault();
								e.stopPropagation();
								await deleteImage(
									selectedImages.map((i) => i.id),
									selectedImages
										.map((i) => i.url)
										.filter((i) => i !== undefined),
								);
							}}
						>
							<Icons.Trash
								size={15}
								aria-hidden="true"
								className="text-red-11"
							/>
							<Kbd>D</Kbd>
						</Button>
					</Tooltip>
				</Card>
			</Box>
		</Flex>
	);
};
