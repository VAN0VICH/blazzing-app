import { Noise } from "@blazzing-app/ui/noise";
import { Box, Container, Grid, Skeleton, Tabs, Text } from "@radix-ui/themes";
import { Link } from "@remix-run/react";
import { StoreInfo } from "./store-info";
import { ProductCard } from "../product/product-card";
import type { Product, Store } from "@blazzing-app/validators/client";
import type { Collection } from "@blazzing-app/validators/server";

export function StoreComponent() {
	const store: Store = {
		id: "store",
		countryCode: "AU",
		createdAt: new Date().toISOString(),
		currencyCodes: ["AUD"],
		description: "My store",
		headerImage: null,
		image: null,
		name: "Pachimari",
		ownerID: "id1",
		version: 1,
		updatedAt: new Date().toISOString(),
	};
	const products: Product[] = [
		{
			id: "whatever",
			collectionID: "whatver1",
			createdAt: new Date().toISOString(),
			baseVariantID: "sef",
			metadata: {},
			score: 1,
			status: "draft",
			storeID: "awd",
			type: "physical",
			updatedAt: new Date().toISOString(),
			updatedBy: "noone",
			version: 1,
			store,
			baseVariant: {
				id: "daw",
				allowBackorder: true,
				barcode: "adwa",
				createdAt: new Date().toISOString(),
				description: "wahwr",
				discountable: true,
				handle: "hello world",
				height: 100,
				images: [],
				thumbnail: null,
				length: 100,
				material: "daw",
				metadata: {},
				originCountry: "AU",
				productID: "whatever",
				quantity: 2,
				sku: "2",
				title: "hello world",
				updatedAt: new Date().toISOString(),
				updatedBy: "what",
				version: 1,
				weight: 100,
				weightUnit: "g",
				width: 100,
			},
			collection: {} as Collection,
			options: [],
			variants: [],
		},
	];
	const isInitialized = true;

	return (
		<Container position="relative">
			<Grid position="relative">
				{!true && <Skeleton height="10rem" width="100%" />}
				<Box className="h-full w-full bg-slate-4">
					<Noise />
				</Box>
			</Grid>

			<StoreInfo store={store} />
			<Tabs.Root defaultValue="account">
				<Tabs.List>
					<Tabs.Trigger value="products">Products</Tabs.Trigger>
					<Tabs.Trigger value="announcements">Announcements</Tabs.Trigger>
				</Tabs.List>

				<Box pt="3">
					<Tabs.Content value="products">
						<ProductSection
							products={products}
							isInitialized={!!isInitialized}
							isDashboard={true}
						/>
					</Tabs.Content>

					<Tabs.Content value="announcements">
						<Text size="2">Access and update your documents.</Text>
					</Tabs.Content>
				</Box>
			</Tabs.Root>
		</Container>
	);
}
const ProductSection = ({
	products,
	isInitialized,
	isDashboard,
}: {
	products: Product[];
	isInitialized: boolean;
	isDashboard?: boolean;
}) => {
	return (
		<Box width="100%" pb={{ initial: "50px", sm: "0px" }}>
			<Grid
				columns={{ initial: "1", xs: "2", sm: "3", md: "4", lg: "5", xl: "6" }}
				gap="3"
			>
				{!isInitialized &&
					Array.from({ length: 4 }).map((_, i) => (
						<Skeleton key={i} className="w-full h-[300px]" />
					))}
				{products.length === 0 && (
					<p className="text-slate-11">No products found.</p>
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
						<ProductCard product={product} key={product.id} />
					</Link>
				))}
			</Grid>
		</Box>
	);
};
