import type { Product } from "@blazzing-app/validators/client";
import { Box, Flex } from "@radix-ui/themes";
import { PageHeader } from "../components/page-header";
import { ProductsTable } from "./product-table/table";
import { product } from "~/temp/mock-entities";

function ProductsPage() {
	return (
		<Flex
			justify="center"
			p={{ initial: "2", sm: "3" }}
			pb={{ initial: "100px", sm: "100px", md: "3" }}
		>
			<Box
				maxWidth="1300px"
				className="bg-component border border-border rounded-[7px]"
				width="100%"
			>
				<PageHeader
					title="Products"
					className="justify-center text-accent-11 border-b border-border md:justify-start p-4"
				/>
				<Products products={[]} />
			</Box>
		</Flex>
	);
}

export default ProductsPage;

function Products({
	products,
}: {
	products: Product[];
}) {
	return (
		<ProductsTable
			products={products}
			createProduct={() => {
				return new Promise((resolve) => {
					resolve();
				});
			}}
			deleteProduct={() => {
				return new Promise((resolve) => {
					resolve(1);
				});
			}}
			copyProduct={() => {
				return new Promise((resolve) => {
					resolve(1);
				});
			}}
		/>
	);
}
