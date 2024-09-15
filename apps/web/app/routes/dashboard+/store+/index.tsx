import { Flex } from "@radix-ui/themes";
import { StoreComponent } from "~/components/templates/store";

export default function StoresPage() {
	return (
		<Flex justify="center" width="100%" p="3">
			<StoreComponent isDashboard={true} />
		</Flex>
	);
}

export { StoresPage };
