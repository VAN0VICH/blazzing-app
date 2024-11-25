import type { Product } from "../../../../../packages/validators/src/store-entities";
import { Badge } from "@radix-ui/themes";

export function ProductStatus({
	status,
	size = "2",
}: { status: Product["status"]; size?: "1" | "2" | "3" }) {
	return status === "draft" ? (
		<Badge color="orange" size={size}>
			Draft
		</Badge>
	) : status === "published" ? (
		<Badge color="green" size={size}>
			Published
		</Badge>
	) : (
		<Badge color="gray" size={size}>
			Archived
		</Badge>
	);
}
