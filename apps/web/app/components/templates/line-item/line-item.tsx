import { Icons } from "@blazzing-app/ui/icons";
import { toast } from "@blazzing-app/ui/toast";
import { getLineItemPriceAmount } from "@blazzing-app/utils";
import type { LineItem as LineItemType } from "@blazzing-app/validators/client";
import {
	Avatar,
	Box,
	Button,
	Card,
	Flex,
	Grid,
	Heading,
	Skeleton,
	Text,
} from "@radix-ui/themes";
import { Effect } from "effect";
import Price from "~/components/price";

export const LineItem = ({
	lineItem,
	deleteItem,
	updateItem,
	currencyCode,
	readonly = false,
}: {
	lineItem: LineItemType;
	deleteItem?: (id: string) => Promise<void>;
	updateItem?: (id: string, quantity: number) => Promise<void>;
	currencyCode: string;
	readonly?: boolean;
}) => {
	const amount =
		Effect.runSync(
			getLineItemPriceAmount(lineItem, currencyCode).pipe(
				Effect.catchTags({
					PriceNotFound: (e) =>
						Effect.try(() => {
							deleteItem?.(lineItem.id).then(() => toast.error(e.message));
						}),
				}),
			),
		) ?? 0;
	return (
		<li className="w-full flex gap-2">
			<Avatar fallback="F" width="50px" height="50px" />
			<Flex justify="between" gap="2">
				<Flex justify="between" direction="column">
					<Heading size="1">{lineItem.title}</Heading>
					<Box>
						{lineItem.variant?.optionValues?.map((v) => (
							<Flex key={v.optionValue.id} gap="1">
								<Text>{v.optionValue.option.name}:</Text>
								<Text>{v.optionValue.value}</Text>
							</Flex>
						))}
					</Box>
					<Flex align="center">
						{readonly ? (
							<Text color="gray">{`quantity: ${lineItem.quantity}`}</Text>
						) : (
							<>
								<Button variant="ghost" disabled={lineItem.quantity === 0}>
									<Icons.Minus size={10} />
								</Button>
								<Text>{lineItem.quantity}</Text>
								<Button variant="ghost" type="button">
									<Icons.Plus size={10} />
								</Button>
							</>
						)}
					</Flex>
				</Flex>
				<Flex direction="column" align="end" justify="between">
					<Price
						amount={amount}
						currencyCode={currencyCode}
						className="font-bold"
					/>
					{!readonly && (
						<Button type="button">
							<Icons.Trash size={12} />
						</Button>
					)}
				</Flex>
			</Flex>
		</li>
	);
};
export const LineItemSkeleton = () => {
	return (
		<li className="w-full flex gap-2">
			<Card className="aspect-square border-none flex items-center justify-center p-0 rounded-lg relative w-[100px]">
				<Skeleton className="w-[100px] h-[100px] rounded-lg" />
			</Card>
			<Flex gap="2" justify="between">
				<Flex direction="column" justify="between" gap="2">
					<Skeleton className="w-[150px] h-[10px]" />
					<Grid gap="2">
						<Skeleton className="w-[150px] h-[10px]" />
						<Skeleton className="w-[150px] h-[10px]" />
					</Grid>
					<Flex align="center">
						<Button variant="ghost" type="button">
							<Icons.Minus size={10} />
						</Button>
						<Skeleton className="w-[15px] h-[15px] mx-2" />
						<Button type="button" variant="ghost">
							<Icons.Plus size={10} />
						</Button>
					</Flex>
				</Flex>
				<Flex direction="column" align="end" justify="between">
					<Skeleton className="w-[50px] h-[10px]" />
					<Button variant="outline" type="button">
						<Icons.Trash size={12} />
					</Button>
				</Flex>
			</Flex>
		</li>
	);
};
