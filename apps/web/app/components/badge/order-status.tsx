import type { StoreOrder } from "@blazzing-app/validators";
import { Badge } from "@radix-ui/themes";

export function OrderStatus({
	status,
	size = "2",
}: { status: StoreOrder["status"]; size?: "1" | "2" | "3" }) {
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
