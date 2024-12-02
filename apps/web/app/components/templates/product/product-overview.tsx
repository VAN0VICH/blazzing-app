import { cn } from "@blazzing-app/ui";
import {
	Drawer,
	DrawerContent,
	DrawerOverlay,
	DrawerTrigger,
} from "@blazzing-app/ui/drawer";
import { Icons } from "@blazzing-app/ui/icons";
import { ToggleGroup, ToggleGroupItem } from "@blazzing-app/ui/toggle-group";
import {
	Box,
	Flex,
	Grid,
	Heading,
	IconButton,
	ScrollArea,
	Text,
	Theme,
} from "@radix-ui/themes";
import React, { useCallback, useEffect, useState } from "react";
import Image from "~/components/image";
import Price from "~/components/price";
import { toImageURL } from "~/utils/helpers";
import { Actions } from "./actions";
import { Gallery } from "./gallery";
import { GeneralInfo } from "./product-info";
import type { StoreProductOption, Variant } from "@blazzing-app/validators";

interface ProductOverviewProps {
	baseVariantIDOrHandle: string | undefined;
	isDashboard?: boolean;
	variants: Variant[];
	selectedVariantIDOrHandle: string;
	selectedVariant: Variant | undefined;
	setVariantIDOrHandle: (prop: string) => void;
	cartID?: string | undefined;
	tempUserID?: string | undefined;
	setView?: (value: "preview" | "input") => void;
}

const ProductOverview = (props: ProductOverviewProps) => {
	const { isDashboard = false, selectedVariant } = props;

	return (
		<Flex
			height="100vh"
			position="relative"
			width="100%"
			direction={{ initial: "column", md: "row" }}
		>
			{/* <MobileGallery
				images={selectedVariant?.images ?? baseVariant?.images ?? []}
				{...(isScrolled && { isScrolled: isScrolled })}
			/> */}
			<Gallery
				images={
					selectedVariant?.images ??
					selectedVariant?.product?.baseVariant.images ??
					[]
				}
			/>
			<Box className="fixed top-[60%] right-5 lg:hidden">
				<ProductInformationMobile {...props} />
			</Box>

			<Flex
				className={cn(
					"h-screen w-full hidden lg:flex lg:w-[400px] sticky top-0 dark:bg-black bg-white",
					{
						"top-14": isDashboard,
					},
				)}
				onClick={(e) => e.stopPropagation()}
			>
				<ScrollArea
					className={cn("lg:min-h-screen lg:w-[400px] lg:mt-0  w-full")}
				>
					<ProductInformation {...props} />
				</ScrollArea>
			</Flex>
		</Flex>
	);
};

export { ProductOverview };

const ProductInformation = (props: ProductOverviewProps) => {
	const {
		isDashboard = false,
		variants,
		setVariantIDOrHandle,
		selectedVariantIDOrHandle,
		selectedVariant,
		cartID,
		setView,
		baseVariantIDOrHandle,
		tempUserID,
	} = props;

	const [isShaking, setIsShaking] = React.useState(false);
	return (
		<Box p="4" mb="100px" width="100%" height="100%">
			<GeneralInfo variant={selectedVariant} {...(setView && { setView })} />
			<Pricing variant={selectedVariant} />
			<Actions
				{...(cartID && { cartID })}
				{...(tempUserID && { tempUserID })}
				selectedVariant={selectedVariant}
				setIsShaking={setIsShaking}
				variants={variants}
				{...(isDashboard && { isDashboard })}
				baseVariantID={selectedVariant?.product?.baseVariantID}
			/>

			<ProductVariants
				variants={variants}
				{...(isDashboard && { isDashboard })}
				setVariantIDOrHandle={setVariantIDOrHandle}
				selectedVariantIDOrHandle={selectedVariantIDOrHandle}
				isDashboard={isDashboard}
				baseVariantIDOrHandle={baseVariantIDOrHandle}
			/>
			<ProductOptions
				options={selectedVariant?.product?.options ?? []}
				selectedVariant={selectedVariant}
				variants={variants}
				setVariantIDOrHandle={setVariantIDOrHandle}
				isShaking={isShaking}
				baseVariantIDOrHandle={baseVariantIDOrHandle}
				isDashboard={isDashboard}
			/>
		</Box>
	);
};

const ProductInformationMobile = (props: ProductOverviewProps) => {
	return (
		<Drawer>
			<DrawerTrigger asChild>
				<IconButton
					type="button"
					variant="outline"
					className="size-[60px] bg-transparent text-accent-11 backdrop-blur-sm rounded-full"
					onClick={(e) => {
						e.stopPropagation();
					}}
				>
					<Icons.Info className="size-8" />
				</IconButton>
			</DrawerTrigger>
			<DrawerOverlay
				className="lg:hidden"
				onClick={(e) => {
					e.preventDefault();
					e.stopPropagation();
				}}
			/>
			<DrawerContent
				onClick={(e) => {
					e.stopPropagation();
				}}
				className="h-[85vh] lg:hidden"
			>
				<Theme>
					<ScrollArea className={cn("h-[calc(100vh-100px)] w-full")}>
						<ProductInformation {...props} />
					</ScrollArea>
				</Theme>
			</DrawerContent>
		</Drawer>
	);
};

export const Pricing = ({ variant }: { variant: Variant | undefined }) => {
	return (
		<Box pt="4">
			<Heading>
				<Price
					amount={variant?.prices?.[0]?.amount ?? 0}
					currencyCode={variant?.prices?.[0]?.currencyCode ?? "BYN"}
				/>
			</Heading>
		</Box>
	);
};

export const ProductVariants = ({
	isDashboard = false,
	variants,
	selectedVariantIDOrHandle,
	setVariantIDOrHandle,
	baseVariantIDOrHandle,
}: {
	isDashboard?: boolean;
	variants: Variant[];
	selectedVariantIDOrHandle: string;
	setVariantIDOrHandle: (prop: string) => void;
	baseVariantIDOrHandle: string | undefined;
}) => {
	if (variants.length === 0) return null;
	return (
		<Box>
			{variants.length > 0 && (
				<Heading className="flex min-w-[4rem] pb-2 items-center font-semibold text-base">
					Variant
				</Heading>
			)}
			<ToggleGroup
				className="flex gap-2 flex-wrap"
				type="single"
				value={selectedVariantIDOrHandle ?? ""}
				variant="outline"
				onValueChange={(value) => {
					if (!value) {
						return (
							baseVariantIDOrHandle &&
							setVariantIDOrHandle(baseVariantIDOrHandle)
						);
					}
					setVariantIDOrHandle(value);
				}}
			>
				{variants?.map((v) => {
					if (
						v.handle === baseVariantIDOrHandle ||
						v.id === baseVariantIDOrHandle
					) {
						return (
							<ToggleGroupItem
								key={v.id}
								value={isDashboard ? v.id : (v.handle ?? "")}
								className="relative border-r border-border size-[100px] p-0"
								onClick={(e) => e.stopPropagation()}
							>
								Base
							</ToggleGroupItem>
						);
					}
					if (
						!v.thumbnail?.url ||
						!toImageURL(v.thumbnail?.base64, v.thumbnail?.fileType)
					)
						return null;
					return (
						<ToggleGroupItem
							key={v.id}
							value={isDashboard ? v.id : (v.handle ?? "")}
							className="relative border-r border-border size-[100px] p-0"
							onClick={(e) => e.stopPropagation()}
						>
							<Box position="relative">
								<Image
									width={{ initial: 100 }}
									fit="cover"
									height={{ initial: 100 }}
									src={
										v.thumbnail?.url ??
										toImageURL(v.thumbnail?.base64, v.thumbnail?.fileType)
									}
									className="object-cover"
								/>
							</Box>
						</ToggleGroupItem>
					);
				})}
			</ToggleGroup>
		</Box>
	);
};

export const ProductOptions = ({
	baseVariantIDOrHandle,

	options,
	selectedVariant,
	variants,
	setVariantIDOrHandle,
	isShaking,
	isDashboard,
}: {
	baseVariantIDOrHandle: string | undefined;
	options: StoreProductOption[];
	selectedVariant: Variant | undefined;
	isShaking: boolean;
	setVariantIDOrHandle: (prop: string) => void;
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
							isDashboard ? variant.id : (variant.handle ?? ""),
						);
						break;
					}
				}
				//variant not found
				if (!variantFound)
					baseVariantIDOrHandle && setVariantIDOrHandle(baseVariantIDOrHandle);
			}
		},
		[variants, setVariantIDOrHandle, baseVariantIDOrHandle, isDashboard],
	);
	if (options.length === 0) return null;
	return (
		<Grid columns="2">
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
								isShaking && "animate-bounce duration-300",
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
