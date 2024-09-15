import { cn } from "@blazzing-app/ui";
import { ToggleGroup, ToggleGroupItem } from "@blazzing-app/ui/toggle-group";
import type {
	Product,
	ProductOption,
	Variant,
} from "@blazzing-app/validators/client";
import React, { useCallback, useEffect, useState } from "react";
import { toImageURL } from "~/utils/helpers";
import { Actions } from "./actions";
import { DesktopGallery, MobileGallery } from "./gallery";
import { GeneralInfo } from "./product-info";
import {
	Avatar,
	Box,
	Flex,
	Grid,
	Heading,
	ScrollArea,
	Text,
} from "@radix-ui/themes";

interface ProductOverviewProps {
	product: Product | undefined;
	isDashboard?: boolean;
	variants: Variant[];
	selectedVariantIDOrHandle: string | undefined;
	selectedVariant: Variant | undefined;
	setVariantIDOrHandle: (prop: string | undefined) => void;
	cartID?: string | undefined;
	baseVariant: Variant | undefined;
	setView?: (value: "preview" | "input") => void;
	isScrolled?: boolean;
}

const ProductOverview = ({
	product,
	isDashboard = false,
	variants,
	setVariantIDOrHandle,
	selectedVariantIDOrHandle,
	selectedVariant,
	cartID,
	baseVariant,
	setView,
	isScrolled,
}: ProductOverviewProps) => {
	const [isShaking, setIsShaking] = React.useState(false);
	return (
		<Flex
			height="100vh"
			position="relative"
			width="100%"
			direction={{ initial: "column", md: "row" }}
		>
			<MobileGallery
				images={selectedVariant?.images ?? baseVariant?.images ?? []}
				{...(isScrolled && { isScrolled: isScrolled })}
			/>
			<DesktopGallery
				images={selectedVariant?.images ?? baseVariant?.images ?? []}
			/>

			{/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
			<Flex
				className={cn(
					"flex h-screen w-full lg:w-[400px] sticky top-0 dark:bg-black bg-white",
					{
						"top-14": isDashboard,
					},
				)}
				onClick={(e) => e.stopPropagation()}
			>
				<ScrollArea
					className={cn(
						"border-t lg:border-t-0 lg:border-border lg:min-h-screen lg:w-[400px]  lg:mt-0  w-full",
					)}
				>
					<Box p="4" width="100%" height="100%">
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
				</ScrollArea>
			</Flex>
		</Flex>
	);
};
export { ProductOverview };

const ProductVariants = ({
	isDashboard = false,
	variants,
	selectedVariantIDOrHandle,
	setVariantIDOrHandle,
}: {
	isDashboard?: boolean;
	variants: Variant[];
	selectedVariantIDOrHandle: string | undefined;
	setVariantIDOrHandle: (prop: string | undefined) => void;
}) => {
	if (variants.length === 0) return null;
	return (
		<Box py="4">
			{variants.length > 0 && (
				<>
					<Heading className="flex min-w-[4rem] py-2 items-center font-semibold text-base">
						Variant
					</Heading>
				</>
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
						className="relative  w-[6rem] min-h-[6rem] p-0"
						onClick={(e) => e.stopPropagation()}
					>
						<Box position="relative">
							{!v.images?.[0] ? (
								<Avatar fallback="4" />
							) : v.images?.[0].url ? (
								<Avatar fallback="4" />
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
	variants: Variant[];
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
		<Grid columns="2" pb="4">
			{options.map((option) => {
				return (
					<Flex direction="column" key={option.id}>
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
					</Flex>
				);
			})}
		</Grid>
	);
};
