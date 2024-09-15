import { Noise } from "@blazzing-app/ui/noise";
import type { Product } from "@blazzing-app/validators/client";
import { Box, Grid, Skeleton, Tabs, Text } from "@radix-ui/themes";
import { Link } from "@remix-run/react";
import { product, store } from "~/temp/mock-entities";
import { ProductCard } from "../product/product-card";
import { StoreInfo } from "./store-info";

export function StoreComponent({
	isDashboard = false,
	storeURL,
}: { isDashboard?: boolean; storeURL?: string }) {
	const products: Product[] = [product, { ...product, id: "Awdawd" }];
	const isInitialized = true;

	return (
		<Box position="relative" width="100%" maxWidth="1300px">
			<Grid position="relative">
				{!true && <Skeleton height="10rem" width="100%" />}
				<Box className="h-full w-full bg- gray-4">
					<Noise />
				</Box>
			</Grid>

			<StoreInfo
				isDashboard={isDashboard}
				store={store}
				{...(storeURL && { storeURL })}
			/>
			<Tabs.Root defaultValue="products" className="pt-3">
				<Tabs.List>
					<Tabs.Trigger value="products">Products</Tabs.Trigger>
					<Tabs.Trigger value="announcements">Announcements</Tabs.Trigger>
				</Tabs.List>

				<Box pt="3">
					<Tabs.Content value="products">
						<ProductSection
							products={products}
							isInitialized={!!isInitialized}
							isDashboard={isDashboard}
						/>
					</Tabs.Content>

					<Tabs.Content value="announcements">
						<Text size="2">No notifications.</Text>
					</Tabs.Content>
				</Box>
			</Tabs.Root>
		</Box>
	);
}
const ProductSection = ({
	products,
	isInitialized,
	isDashboard = false,
}: {
	products: Product[];
	isInitialized: boolean;
	isDashboard?: boolean;
}) => {
	return (
		<Box width="100%" pb={{ initial: "50px", sm: "0px" }}>
			<Grid
				columns={{ initial: "2", xs: "3", sm: "4", lg: "4", xl: "5" }}
				gap="3"
			>
				{!isInitialized &&
					Array.from({ length: 4 }).map((_, i) => (
						<Skeleton key={i} className="w-full h-[300px]" />
					))}
				{products.length === 0 && (
					<p className="text- gray-11">No products found.</p>
				)}
				{products?.map((product) => (
					<Link
						key={product.id}
						to={
							isDashboard
								? `/dashboard/products/${product.id}`
								: `/stores/${product.store.name}/products/${product.baseVariant.handle}`
						}
						prefetch="viewport"
						className="focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1"
					>
						<ProductCard
							product={product}
							key={product.id}
							{...(isDashboard && { isDashboard })}
						/>
					</Link>
				))}
			</Grid>
		</Box>
	);
};
