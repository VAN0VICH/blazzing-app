import type { StoreOrder } from "@blazzing-app/validators";
import { Badge } from "@radix-ui/themes";

export function ShippingStatus({
	status,
	size = "2",
}: { status: StoreOrder["shippingStatus"]; size?: "1" | "2" | "3" }) {
	return status === "pending" ? (
		<Badge color="red" size={size}>
			Pending
		</Badge>
	) : status === "shipped" ? (
		<Badge color="yellow" size={size}>
			Shipped
		</Badge>
	) : status === "delivered" ? (
		<Badge color="green" size={size}>
			Delivered
		</Badge>
	) : (
		<Badge color="gray" size={size}>
			Cancelled
		</Badge>
	);
}
