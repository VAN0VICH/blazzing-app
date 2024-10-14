import dayjs from "dayjs";

export function formatISODate(
	isoDateString: string | undefined | null,
): string {
	if (!isoDateString) return "";
	return dayjs(isoDateString).format("DD/MM/YY HH:mm:ss");
}
