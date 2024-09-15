import { cn } from "@blazzing-app/ui";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@blazzing-app/ui/carousel";
import { ToggleGroup, ToggleGroupItem } from "@blazzing-app/ui/toggle-group";
import type { Image as ImageType } from "@blazzing-app/validators";
import type {
	Product,
	ProductOption,
	PublishedProduct,
	PublishedVariant,
	Variant,
} from "@blazzing-app/validators/client";
import { Avatar, Box, Flex, Grid, Heading, Text } from "@radix-ui/themes";
import { useCallback, useEffect, useState } from "react";
import { toImageURL } from "~/utils/helpers";
import { Actions } from "./actions";
import { GeneralInfo } from "./product-info";

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
		<Flex
			position="relative"
			direction={{ initial: "column", md: "row" }}
			width="100%"
			maxWidth="1300px"
		>
			<Gallery images={selectedVariant?.images ?? baseVariant?.images ?? []} />

			<Flex width="100%" onClick={(e) => e.stopPropagation()}>
				<Box p="4" width="100%">
					<GeneralInfo
						baseVariant={baseVariant}
						product={product}
						{...(setView && { setView })}
					/>
					<Actions
						{...(cartID && { cartID })}
						product={product}
						baseVariant={baseVariant}
						selectedVariant={selectedVariant}
						setIsShaking={setIsShaking}
						variants={variants}
						{...(isDashboard && { isDashboard })}
					/>
					<ProductVariants
						variants={variants}
						{...(isDashboard && { isDashboard })}
						setVariantIDOrHandle={setVariantIDOrHandle}
						selectedVariantIDOrHandle={selectedVariantIDOrHandle}
						isDashboard={isDashboard}
					/>
					<ProductOptions
						options={product?.options ?? []}
						selectedVariant={selectedVariant}
						variants={variants}
						setVariantIDOrHandle={setVariantIDOrHandle}
						isDashboard={isDashboard}
						isShaking={isShaking}
					/>
				</Box>
			</Flex>
		</Flex>
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
			width="100%"
			align="center"
			justify="center"
			gap="4"
		>
			<Carousel>
				<CarouselContent className="shadow-none">
					{images.map(({ base64, url, alt, id, fileType }) => (
						<CarouselItem
							key={id}
							className={cn("shadow-none w-full flex justify-center")}
							onClick={(e) => e.stopPropagation()}
						>
							{!url ? (
								<img
									alt={alt}
									className={cn(
										"md:rounded-lg w-max max-w-full select-none object-contain object-center",
									)}
									src={toImageURL(base64, fileType)}
								/>
							) : (
								<Avatar fallback="B" />
							)}
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
						<CarouselPrevious onClick={(e) => e.stopPropagation()} />
						<CarouselNext onClick={(e) => e.stopPropagation()} />
					</>
				)}
			</Carousel>
		</Flex>
	);
};

const ProductVariants = ({
	isDashboard = false,
	variants,
	selectedVariantIDOrHandle,
	setVariantIDOrHandle,
}: {
	isDashboard?: boolean;
	variants: (Variant | PublishedVariant)[];
	selectedVariantIDOrHandle: string | undefined;
	setVariantIDOrHandle: (prop: string | undefined) => void;
}) => {
	if (variants.length === 0) return null;
	return (
		<Box py="4">
			{variants.length > 0 && (
				<Heading className="flex min-w-[4rem] py-2 items-center font-semibold text-base">
					Variant
				</Heading>
			)}
			<ToggleGroup
				className="grid grid-cols-3 lg:grid-cols-3 gap-2 "
				type="single"
				value={selectedVariantIDOrHandle ?? ""}
				variant="outline"
				onValueChange={(value) => {
					setVariantIDOrHandle(value);
				}}
			>
				{variants?.map((v) => (
					<ToggleGroupItem
						key={v.id}
						value={isDashboard ? v.id : v.handle ?? ""}
						className="relative w-[6rem] min-h-[6rem] p-0"
						onClick={(e) => e.stopPropagation()}
					>
						<Box className="relative">
							{!v.images?.[0] ? (
								<Avatar fallback="g" />
							) : v.images?.[0].url ? (
								<Avatar fallback="g" />
							) : (
								<img
									src={toImageURL(v.images?.[0].base64, v.images?.[0].fileType)}
									alt={v.images?.[0].alt ?? "Product image"}
									className="rounded-md object-cover"
								/>
							)}
						</Box>
					</ToggleGroupItem>
				))}
			</ToggleGroup>
		</Box>
	);
};

const ProductOptions = ({
	options,
	selectedVariant,
	variants,
	setVariantIDOrHandle,
	isDashboard,
	isShaking,
}: {
	options: ProductOption[];
	selectedVariant: Variant | undefined;
	isShaking: boolean;
	setVariantIDOrHandle: (prop: string | undefined) => void;
	variants: (Variant | PublishedVariant)[];
	isDashboard?: boolean;
}) => {
	const [variantOptions, setVariantOptions] = useState<Record<string, string>>(
		{},
	);

	useEffect(() => {
		if (selectedVariant) {
			const variantOptions = (selectedVariant?.optionValues ?? []).reduce(
				(acc, curr) => {
					acc[curr.optionValue.optionID] = curr.optionValue.value;
					return acc;
				},
				{} as Record<string, string>,
			);
			setVariantOptions(variantOptions);
		} else {
			setVariantOptions({});
		}
	}, [selectedVariant]);

	const setVariant = useCallback(
		(options: Record<string, string>) => {
			if (Object.keys(options).length > 0) {
				let variantFound = false;
				for (const variant of variants) {
					let optionValuesEqual = true;
					if (variant.optionValues?.length === 0) optionValuesEqual = false;
					for (const value of variant.optionValues ?? []) {
						if (
							options[value.optionValue.optionID] !== value.optionValue.value
						) {
							optionValuesEqual = false;
						}
					}
					if (optionValuesEqual) {
						variantFound = true;
						setVariantIDOrHandle(
							isDashboard ? variant.id : variant.handle ?? undefined,
						);
						break;
					}
				}
				//variant not found
				if (!variantFound) setVariantIDOrHandle(undefined);
			}
		},
		[variants, setVariantIDOrHandle, isDashboard],
	);
	if (options.length === 0) return null;
	return (
		<Grid columns="2" pb="$">
			{options.map((option) => {
				return (
					<Grid key={option.id}>
						<Text className="flex min-w-[4rem] py-2 items-center font-semibold text-base">
							{`${(option.name ?? " ")[0]?.toUpperCase()}${option.name?.slice(
								1,
							)}`}
						</Text>
						<ToggleGroup
							className={cn(
								"flex justify-start",
								isShaking && "animate-shake duration-300",
							)}
							type="single"
							value={variantOptions[option.id] ?? ""}
							onValueChange={async (value) => {
								const newVariantOptions = {
									...variantOptions,
									[option.id]: value,
								};
								setVariantOptions(newVariantOptions);
								setVariant(newVariantOptions);
							}}
							onClick={(e) => e.stopPropagation()}
						>
							{option.optionValues?.map((val) => {
								const variant = variants.find((variant) => {
									return variant.optionValues?.some(
										(v) => v.optionValue.id === val.id,
									);
								});
								const isInStock = variant ? variant.quantity > 0 : false;
								return (
									<ToggleGroupItem
										key={val.id}
										value={val.value}
										disabled={!isInStock}
									>
										{val.value}
									</ToggleGroupItem>
								);
							})}
						</ToggleGroup>
					</Grid>
				);
			})}
		</Grid>
	);
};
