import type { Product, Variant } from "@blazzing-app/validators/client";
import { Box, Flex, Heading } from "@radix-ui/themes";
import { ProductsTable } from "./product-table/table";
import { useDashboardStore } from "~/zustand/store";
import { useNavigate } from "@remix-run/react";
import React from "react";
import { useReplicache } from "~/zustand/replicache";
import { generateID } from "@blazzing-app/utils";
import { toast } from "@blazzing-app/ui/toast";
import debounce from "lodash.debounce";
import type {
	SearchWorkerRequest,
	SearchWorkerResponse,
} from "~/worker/search";

function ProductsPage() {
	const activeStoreID = useDashboardStore((state) => state.activeStoreID);
	const storeMap = useDashboardStore((state) => state.storeMap);
	const store = storeMap.get(activeStoreID ?? "");
	const products = useDashboardStore((state) =>
		state.products.filter((product) => product.storeID === activeStoreID),
	);
	return (
		<Flex
			justify="center"
			p={{ initial: "2", sm: "3" }}
			className="pb-20 lg:pb-3"
		>
			<Box
				maxWidth="1700px"
				className="bg-component border border-border rounded-[7px]"
				width="100%"
			>
				<Heading
					size="6"
					className="p-4 font-freeman justify-center text-accent-11 border-b border-border md:justify-start"
				>
					Products
				</Heading>
				<Products products={products} storeID={store?.id} />
			</Box>
		</Flex>
	);
}

export default ProductsPage;

function Products({
	products,
	storeID,
}: {
	products: Product[];
	storeID: string | undefined;
}) {
	const navigate = useNavigate();
	const searchWorker = useDashboardStore((state) => state.searchWorker);
	const [searchResults, setSearchResults] = React.useState<
		Product[] | undefined
	>(undefined);
	const [_, startTransition] = React.useTransition();
	const dashboardRep = useReplicache((state) => state.dashboardRep);
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const createProduct = React.useCallback(async () => {
		if (dashboardRep && storeID) {
			const productID = generateID({ prefix: "product" });

			await dashboardRep.mutate.createProduct({
				product: {
					id: productID,
					createdAt: new Date().toISOString(),
					status: "draft",
					storeID,
					version: 0,
					baseVariantID: generateID({ prefix: "variant" }),
				},
			});
			toast.success("Product created successfully.");
			navigate(`/dashboard/products/${productID}`);
		}
	}, [dashboardRep, storeID]);
	const deleteProduct = React.useCallback(
		(keys: string[]) => {
			if (!dashboardRep) return;
			toast.promise(
				"Product deleted.",
				dashboardRep?.mutate.deleteProduct({ keys }),
			);
		},
		[dashboardRep],
	);
	const copyProduct = React.useCallback(
		async (keys: string[]) => {
			if (!dashboardRep) return;
			startTransition(() => {
				toast.promise(
					"Product duplicated",
					dashboardRep.mutate.copyProduct({
						duplicates: keys.map((id) => ({
							originalProductID: id,
							newBaseVariantID: generateID({ prefix: "variant" }),
							newProductID: generateID({ prefix: "product" }),
							newOptionIDs: Array.from<string>({ length: 10 }).map(() =>
								generateID({ prefix: "p_option" }),
							),
							newOptionValueIDs: Array.from<string>({ length: 20 }).map(() =>
								generateID({ prefix: "p_op_val" }),
							),
							newPriceIDs: Array.from<string>({ length: 10 }).map(() =>
								generateID({ prefix: "price" }),
							),
						})),
					}),
					"Too many products to duplicate at once.",
				);
			});
		},
		[dashboardRep],
	);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const onSearch = React.useCallback(
		debounce((value: string) => {
			if (value === "") {
				setSearchResults(undefined);
				return;
			}
			searchWorker?.postMessage({
				type: "PRODUCT_SEARCH",
				payload: {
					query: value,
				},
			} satisfies SearchWorkerRequest);
		}, 300),
		[searchWorker],
	);
	React.useEffect(() => {
		if (searchWorker) {
			searchWorker.onmessage = (event: MessageEvent) => {
				const { type, payload } = event.data as SearchWorkerResponse;
				if (typeof type === "string" && type === "PRODUCT_SEARCH") {
					startTransition(() => {
						const variants = payload.filter((p) =>
							p.id.startsWith("variant"),
						) as Variant[];
						const productIDs = new Set(variants.map((v) => v.productID));
						setSearchResults(products.filter((p) => productIDs.has(p.id)));
					});
				}
			};
		}
	}, [searchWorker, products]);

	return (
		<ProductsTable
			products={searchResults ?? products}
			createProduct={createProduct}
			deleteProduct={deleteProduct}
			copyProduct={copyProduct}
			onSearch={onSearch}
		/>
	);
}
