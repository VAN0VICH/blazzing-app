import { Flex } from "@radix-ui/themes";
import { StoreComponent } from "~/components/templates/store";
import { useDashboardStore } from "~/zustand/store";

export default function StoresPage() {
	const activeStoreID = useDashboardStore((state) => state.activeStoreID);
	const isInitialized = useDashboardStore((state) => state.isInitialized);
	const storeMap = useDashboardStore((state) => state.storeMap);
	const store = storeMap.get(activeStoreID ?? "");
	const products = useDashboardStore((state) =>
		state.products.filter((product) => product.storeID === activeStoreID),
	);
	return (
		<Flex justify="center" width="100%" p="3" pb="20">
			<StoreComponent
				isDashboard={true}
				isInitialized={isInitialized}
				products={products}
				store={store}
			/>
		</Flex>
	);
}

export { StoresPage };
