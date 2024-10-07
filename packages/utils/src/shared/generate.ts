import { ulid } from "ulidx";

const prefixes = [
	"auth",
	"address",
	"user",
	"product",
	"tag",
	"collection",
	"category",
	"variant",
	"p_option",
	"p_op_val",
	"price",
	"cart",
	"img",
	"unauth",
	"store",
	"error",
	"space",
	"line_item",
	"order",
	"notification",
	"verification",
	"session",
	"customer",
	"payment_profile",
	"balance",
	"transfer_group",
] as const;

export type Prefix = (typeof prefixes)[number];

export const generateID = ({
	prefix,
}: { prefix?: (typeof prefixes)[number] }) => {
	if (!prefix) {
		return ulid();
	}
	return `${prefix}_${ulid()}`;
};

export function generateBoundary() {
	const boundary = "--------------------------";
	const randomBytes = new Uint8Array(16);
	crypto.getRandomValues(randomBytes);
	return (
		boundary +
		randomBytes.reduce(
			(str, byte) => str + byte.toString(16).padStart(2, "0"),
			"",
		)
	);
}
