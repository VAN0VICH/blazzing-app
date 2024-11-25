import type { StoreOrder } from "@blazzing-app/validators";
import { Badge } from "@radix-ui/themes";
export function PaymentStatus({
	status,
	size = "2",
}: { status: StoreOrder["paymentStatus"]; size?: "1" | "2" | "3" }) {
	return status === "paid" ? (
		<Badge color="green" size={size}>
			Paid
		</Badge>
	) : (
		<Badge color="gray" size={size}>
			refunded
		</Badge>
	);
}
