import { Icons } from "@blazzing-app/ui/icons";
import { Box, Flex, Text } from "@radix-ui/themes";
import { Link, useParams } from "@remix-run/react";
import { useState } from "react";
import { ProductInput } from "./product-input";
import { ProductPreview } from "./product-preview";

function ProductRoute() {
	const params = useParams();
	const [view, setView] = useState<"input" | "preview">("input");

	return (
		<Box width="100%" height="100%" position="relative">
			<Flex justify="center" position="relative">
				{view === "input" ? (
					<ProductInput
						setView={setView}
						productID={params.id!}
						product={undefined}
						baseVariant={undefined}
					/>
				) : (
					<ProductPreview product={undefined} setView={setView} />
				)}
			</Flex>
		</Box>
	);
}

export default ProductRoute;
