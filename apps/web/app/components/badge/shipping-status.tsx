import type { Order } from "@blazzing-app/validators/client";
import { Badge } from "@radix-ui/themes";

export function ShippingStatus({
	status,
	size = "2",
}: { status: Order["shippingStatus"]; size?: "1" | "2" | "3" }) {
	return status === "pending" ? (
		<Badge color="red" size={size}>
			Pending
		</Badge>
	) : status === "shipped" ? (
		<Badge color="yellow" size={size}>
			Shipped
		</Badge>
	) : status === "delivered" ? (
		<Badge color="jade" size={size}>
			Delivered
		</Badge>
	) : (
		<Badge color="gray" size={size}>
			Cancelled
		</Badge>
	);
}