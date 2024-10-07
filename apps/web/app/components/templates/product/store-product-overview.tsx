import { cn } from "@blazzing-app/ui";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@blazzing-app/ui/carousel";
import type { Image as ImageType } from "@blazzing-app/validators";
import type {
	Product,
	PublishedProduct,
	PublishedVariant,
	Variant,
} from "@blazzing-app/validators/client";
import { Avatar, Box, Button, Flex, Separator } from "@radix-ui/themes";
import { useState } from "react";
import Image from "~/components/image";
import { toImageURL } from "~/utils/helpers";
import { Actions } from "./actions";
import { GeneralInfo } from "./product-info";
import { Pricing, ProductOptions, ProductVariants } from "./product-overview";

interface StoreProductOverviewProps {
	product: Product | PublishedProduct | undefined;
	isDashboard?: boolean;
	variants: (Variant | PublishedVariant)[];
	selectedVariantIDOrHandle: string | undefined;
	selectedVariant: Variant | PublishedVariant | undefined;
	setVariantIDOrHandle: (prop: string | undefined) => void;
	cartID?: string | undefined;
	baseVariant: Variant | PublishedVariant | undefined;
	setView?: (value: "preview" | "input") => void;
}

const StoreProductOverview = ({
	product,
	isDashboard = false,
	variants,
	setVariantIDOrHandle,
	selectedVariantIDOrHandle,
	selectedVariant,
	cartID,
	baseVariant,
	setView,
}: StoreProductOverviewProps) => {
	const [isShaking, setIsShaking] = useState(false);

	return (
		<Box width="100%">
			<Flex direction={{ initial: "column", md: "row" }} width="100%" gap="3">
				{/*left*/}
				<Box
					width={{ initial: "100%", md: "20%" }}
					position="relative"
					maxWidth={{ md: "300px" }}
				>
					<Box width="100%" position="sticky" top="0">
						<GeneralInfo
							baseVariant={baseVariant}
							product={product}
							{...(setView && { setView })}
						/>
					</Box>
				</Box>
				{/*center*/}
				<Gallery
					images={selectedVariant?.images ?? baseVariant?.images ?? []}
				/>

				{/*right*/}
				<Flex
					width={{ initial: "100%", md: "30%" }}
					position="relative"
					onClick={(e) => e.stopPropagation()}
					maxWidth={{ md: "500px" }}
				>
					<Box width="100%" top="0" position="sticky" className="h-fit">
						{setView && (
							<Button
								variant="outline"
								type="button"
								size="2"
								onClick={async () => {
									setView("input");
								}}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										e.preventDefault();
										e.stopPropagation();
										setView("input");
									}
								}}
							>
								Edit
							</Button>
						)}
						<ProductVariants
							variants={variants}
							{...(isDashboard && { isDashboard })}
							setVariantIDOrHandle={setVariantIDOrHandle}
							selectedVariantIDOrHandle={selectedVariantIDOrHandle}
							isDashboard={isDashboard}
						/>
						<Separator className="w-full" />
						<ProductOptions
							options={product?.options ?? []}
							selectedVariant={selectedVariant}
							variants={variants}
							setVariantIDOrHandle={setVariantIDOrHandle}
							isDashboard={isDashboard}
							isShaking={isShaking}
						/>
						<Separator className="w-full" />
						<Pricing variant={selectedVariant ?? baseVariant} />
						<Actions
							{...(cartID && { cartID })}
							product={product}
							baseVariant={baseVariant}
							selectedVariant={selectedVariant}
							setIsShaking={setIsShaking}
							variants={variants}
							{...(isDashboard && { isDashboard })}
						/>
					</Box>
				</Flex>
			</Flex>
			<Flex height="1000px" />
		</Box>
	);
};
export { StoreProductOverview };

interface GalleryProps {
	images: ImageType[];
}
const Gallery = ({ images }: GalleryProps) => {
	return (
		<Flex
			direction="column"
			width={{ initial: "100%", md: "50%" }}
			align="center"
			justify="center"
			gap="4"
			minWidth="300px"
		>
			<Carousel>
				<CarouselContent className="shadow-none">
					{images.map(({ base64, url, alt, id, fileType }) => (
						<CarouselItem
							key={id}
							className={cn("shadow-none w-full flex justify-center")}
							onClick={(e) => e.stopPropagation()}
						>
							<Image
								onClick={(e) => e.stopPropagation()}
								src={url ?? toImageURL(base64, fileType)}
								alt={alt}
								className="rounded-[7px] border border-border"
							/>
						</CarouselItem>
					))}
					{images.length === 0 && (
						<CarouselItem className="aspect-square">
							<Flex
								justify="center"
								align="center"
								className="p-4 relative bg-accent-3 size-[300px] text-center  cursor-pointer aspect-square"
							>
								<Avatar fallback="B" />
							</Flex>
						</CarouselItem>
					)}
				</CarouselContent>
				{images.length > 0 && (
					<>
						<CarouselPrevious />
						<CarouselNext />
					</>
				)}
			</Carousel>
		</Flex>
	);
};
