import { cn } from "@blazzing-app/ui";
import { Icons } from "@blazzing-app/ui/icons";
import { ToggleGroup, ToggleGroupItem } from "@blazzing-app/ui/toggle-group";
import type { Product } from "@blazzing-app/validators/client";
import { Avatar, Badge, Box, Flex, Heading, Skeleton } from "@radix-ui/themes";
import { Link } from "@remix-run/react";
import Image from "~/components/image";
import ImagePlaceholder from "~/components/image-placeholder";
import Price from "~/components/price";
import { toImageURL } from "~/utils/helpers";
const Products = ({
	isAuction = false,
	products,
	isInitialized,
	isDashboard,
	isMarketplace = false,
}: {
	isAuction?: boolean;
	products: Product[];
	isInitialized?: boolean;
	isDashboard?: boolean;
	isMarketplace?: boolean;
}) => {
	console.log("products", products);
	if (!isInitialized)
		return (
			<Flex direction="column" gap="2" pt="2">
				<div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5  gap-4">
					{[...Array(10)].map((_, index) => (
						<ProductSkeleton key={index} />
					))}
				</div>
			</Flex>
		);
	if (isInitialized && products.length === 0) {
		return (
			<Flex direction="column" align="center" justify="center" height="200px">
				<Heading size="4" className="text-center font-freeman " color="gray">
					No products found.
				</Heading>
			</Flex>
		);
	}
	return (
		<Flex direction="column" gap="2" className="pt-2 md:pt-0">
			<div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4">
				{products.map((product) => (
					<ProductComponent
						product={product}
						key={product.id}
						{...(isDashboard && { isDashboard })}
						{...(isAuction && { isAuction })}
						{...(isMarketplace && { isMarketplace })}
					/>
				))}
			</div>
		</Flex>
	);
};

const ProductComponent = ({
	product,
	isAuction,
	isDashboard,
	isMarketplace,
}: {
	product: Product;
	isAuction?: boolean;
	isDashboard?: boolean;
	isMarketplace?: boolean;
}) => {
	return (
		<Box key={product.id} className="mb-4 break-inside-avoid">
			<Box className="relative group rounded-[7px] min-h-[100px] bg-accent-3">
				<Link
					to={
						isDashboard
							? `/dashboard/products/${product.id}`
							: isMarketplace
								? `/marketplace/products/${product.baseVariant.handle}?storeID=${product.storeID}`
								: `/stores/${product.store.name}/products/${product.baseVariant.handle}?storeID=${product.storeID}`
					}
					prefetch="viewport"
				>
					<Image
						src={
							product.baseVariant.thumbnail?.url ??
							toImageURL(
								product.baseVariant.thumbnail?.base64,
								product.baseVariant.thumbnail?.fileType,
							)
						}
						alt={product.baseVariant.thumbnail?.alt}
						className="w-full cursor-pointer rounded-[7px]"
					/>
					<Box
						className={cn(
							"hidden md:flex absolute gap-2 rounded-[7px] cursor-pointer inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 items-center justify-center",
							{
								"hidden md:hidden": isAuction,
							},
						)}
					>
						{/* <Button
							onClick={(e) => {
								e.preventDefault();
							}}
						>
							Add to cart
						</Button> */}
					</Box>
				</Link>
				<Box
					position="absolute"
					top="2"
					right="2"
					className="scale-75 md:scale-90 lg:scale-100"
				>
					{!isAuction ? (
						<Price
							amount={12}
							currencyCode="BYN"
							className="border rounded-[5px] font-bold max-h-[30px] flex items-center justify-center text-sm p-1 bg-accent-3 border-accent-9 text-accent-11"
						/>
					) : (
						<Badge variant="solid" size="3">
							Live
						</Badge>
					)}
				</Box>
			</Box>
			<Flex justify="between" gap="2" pt="2" align="center">
				<Flex gap="2" align="center">
					<Avatar
						fallback={<ImagePlaceholder />}
						className="size-8"
						src={
							product?.store.image?.cropped?.url ??
							toImageURL(
								product?.store?.image?.cropped?.base64,
								product?.store?.image?.cropped?.fileType,
							)
						}
					/>
					<Heading
						size="2"
						className="overflow-hidden text-ellipsis line-clamp-1"
					>
						{product.baseVariant.title}
					</Heading>
				</Flex>
				<Flex gap="2">
					{!isAuction && (
						<ToggleGroup type="single">
							<ToggleGroupItem
								value="save"
								className="w-full aspect-square size-8 text-sm flex gap-2"
								onClick={(e) => e.stopPropagation()}
							>
								<Icons.Bookmark className="min-w-[16px] text-accent-11" />
							</ToggleGroupItem>
						</ToggleGroup>
					)}
				</Flex>
			</Flex>
		</Box>
	);
};

const ProductSkeleton = () => {
	// Generate a random height between 200px and 400px
	const randomHeight = Math.floor(Math.random() * (500 - 100 + 1)) + 100;

	return (
		<Box className="mb-4 break-inside-avoid">
			<Box className="relative group rounded-[7px]">
				<Skeleton
					className="w-full rounded-[7px]"
					style={{ height: `${randomHeight}px` }}
				/>
				<Box position="absolute" top="2" right="2">
					<Skeleton className="w-[60px] h-[30px] rounded-[5px]" />
				</Box>
			</Box>
			<Flex justify="between" gap="2" pt="2" align="center">
				<Flex gap="2" align="center">
					<Skeleton className="w-8 h-8 rounded-full" />
					<Skeleton className="w-[120px] h-[20px]" />
				</Flex>
				<Flex gap="2">
					<Skeleton className="w-8 h-8" />
				</Flex>
			</Flex>
		</Box>
	);
};
export { Products };
