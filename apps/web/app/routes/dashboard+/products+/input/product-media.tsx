import { cn } from "@blazzing-app/ui";
import { Icons } from "@blazzing-app/ui/icons";
import { Sortable, SortableItem } from "@blazzing-app/ui/sortable";
import type { Image as ImageType } from "@blazzing-app/validators";
import { closestCorners, DndContext } from "@dnd-kit/core";
import {
	Box,
	Card,
	Checkbox,
	Flex,
	Grid,
	Heading,
	Tooltip,
} from "@radix-ui/themes";
import React from "react";

export function Media({
	images,
	variantID,
	className,
}: Readonly<{
	images: ImageType[] | undefined;
	variantID: string | undefined;
	className?: string;
}>) {
	const [imagesState, setImagesState] = React.useState(images ?? []);
	const [selectedImages, setSelectedImages] = React.useState<ImageType[]>([]);

	React.useEffect(() => {
		if (images) setImagesState(images);
	}, [images]);

	return (
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
			{/* <FileUpload files={images} maxFiles={8} maxSize={10 * 1024 * 1024} /> */}
			<DndContext>
				{images && images.length > 0 && (
					<Box position="relative" p="4">
						<Grid columns={{ initial: "2", xs: "3", sm: "4", md: "5" }} gap="4">
							{images.map((img) => (
								<Box
									key={img.id}
									className={cn(
										"group bg- gray-2 border border-border shadow-inner rounded-lg aspect-square relative min-w-[120px] min-h-[120px]",
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
								// updateImagesOrder({ order }).catch((err) =>
								// 	console.log(err),
								// );
							}}
						>
							<div className="grid gap-4 grid-cols-2 inset-4 absolute min-[420px]:grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 ">
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
											className="focus-visible:ring-1 focus-visible:ring-ring rounded-md"
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
												{/* {image?. ? (
															<Image
																src={image.url}
																alt={image.name ?? "Uploaded image"}
																fit="cover"
																width={120}
																height={120}
																className="border aspect-square border-border w-full h-full object-contain rounded-md"
															/>
														) : (
															<>
																<img
																	src={toImageURL(image.base64, image.fileType)}
																	alt={image.name ?? "Uploaded image"}
																	className="border brightness-75 w-full h-full aspect-square object-contain border-border   rounded-md"
																/>
																<div className="absolute inset-0 flex items-center justify-center">
																	<LoadingSpinner className="text- gray-2 size-10" />
																</div>
															</>
														)} */}
												<Checkbox
													checked={selectedImages.some(
														(i) => i.id === image.id,
													)}
													onCheckedChange={(value) => {
														if (value) {
															setSelectedImages([...selectedImages, image]);
														} else {
															setSelectedImages(
																selectedImages.filter((i) => i.id !== image.id),
															);
														}
													}}
													tabIndex={-1}
													className={cn(
														"hidden group-hover:block absolute right-2 top-2 checkbox-class bg- gray-2",
														{
															block: selected,
														},
													)}
												/>
											</div>
										</SortableItem>
									);
								})}
							</div>
						</Sortable>
					</Box>
				)}
			</DndContext>
		</Card>
	);
}

// const FloatingBar = ({
// 	selectedImages,
// 	deleteImage,
// }: {
// 	selectedImages: ImageType[];
// 	deleteImage: (keys: string[], urls: string[]) => Promise<void>;
// }) => {
// 	return (
// 		<div className="fixed inset-x-0 bottom-16 lg:bottom-10 rounded-lg z-30 w-fit px-4 left-1/2 -translate-x-1/2">
// 			<TooltipProvider>
// 				<div className="w-full overflow-x-auto">
// 					<Card className="mx-auto flex w-fit items-center gap-2 p-2 shadow-2xl">
// 						<CardContent className="flex items-center gap-1.5">
// 							<Tooltip delayDuration={250}>
// 								<TooltipTrigger asChild>
// 									<Button
// 										variant="ghost"
// 										className="flex gap-3"
// 										onClick={async (e) => {
// 											e.preventDefault();
// 											e.stopPropagation();
// 											await deleteImage(
// 												selectedImages.map((i) => i.id),
// 												selectedImages.map((i) => i.url),
// 											);
// 										}}
// 									>
// 										<Icons.Trash
// 											size={15}
// 											aria-hidden="true"
// 											className="text-red-9"
// 										/>
// 										<Kbd>D</Kbd>
// 									</Button>
// 								</TooltipTrigger>
// 								<TooltipContent>
// 									<p>Delete images</p>
// 								</TooltipContent>
// 							</Tooltip>
// 						</CardContent>
// 					</Card>
// 				</div>
// 			</TooltipProvider>
// 		</div>
// 	);
// };
