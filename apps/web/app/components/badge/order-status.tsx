import type { Order } from "@blazzing-app/validators/client";
import { Badge } from "@radix-ui/themes";

export function OrderStatus({
	status,
	size = "2",
}: { status: Order["status"]; size?: "1" | "2" | "3" }) {
	return status === "pending" ? (
		<Badge color="red" size={size}>
			Pending
		</Badge>
	) : status === "completed" ? (
		<Badge variant={"outline"} color="green" size={size}>
			Delivered
		</Badge>
	) : (
		<Badge size={size} color="gray">
			Cancelled
		</Badge>
	);
}
