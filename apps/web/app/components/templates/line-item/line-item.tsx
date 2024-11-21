import { Icons } from "@blazzing-app/ui/icons";
import { toast } from "@blazzing-app/ui/toast";
import { getLineItemPriceAmount } from "@blazzing-app/core";
import type { LineItem as LineItemType } from "@blazzing-app/validators/client";
import {
	Avatar,
	Badge,
	Box,
	Button,
	Card,
	Flex,
	Grid,
	Heading,
	IconButton,
	Skeleton,
	Text,
} from "@radix-ui/themes";
import { Effect } from "effect";
import React from "react";
import ImagePlaceholder from "~/components/image-placeholder";
import Price from "~/components/price";
import { decapitalize } from "~/utils/helpers";

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
	const amount = React.useMemo(
		() =>
			Effect.runSync(
				getLineItemPriceAmount(lineItem, currencyCode).pipe(
					Effect.catchTags({
						PriceNotFound: (e) =>
							Effect.try(() => {
								deleteItem?.(lineItem.id).then(() => toast.error(e.message));
							}),
					}),
				),
			) ?? 0,
		[currencyCode, deleteItem, lineItem],
	);

	const reduceQuantity = async () => {
		if (lineItem.quantity === 1) return await deleteItem?.(lineItem.id);
		await updateItem?.(lineItem.id, lineItem.quantity - 1);
	};

	const increaseQuantity = async () => {
		await updateItem?.(lineItem.id, lineItem.quantity + 1);
	};

	return (
		<Card className="gap-2 flex w-full items-center p-2 rounded-[7px]">
			<Avatar
				src={
					lineItem.variant.thumbnail?.url ??
					lineItem.product?.baseVariant?.thumbnail?.url
				}
				fallback={<ImagePlaceholder />}
				width="100px"
				height="100px"
			/>
			<Flex justify="between" gap="2" width="100%">
				<Flex justify="between" direction="column" gap="1">
					<Heading size="1">{lineItem.title}</Heading>
					<Box>
						{lineItem.variant?.optionValues?.map((v) => (
							<Flex key={v.optionValue.id} gap="1">
								<Text size="2" weight="medium">
									{decapitalize(v.optionValue?.option?.name ?? "")}:
								</Text>
								<Badge size="1" variant="surface">
									{v.optionValue.value}
								</Badge>
							</Flex>
						))}
					</Box>
					<Flex align="center">
						{readonly ? (
							<Text color="gray">{`quantity: ${lineItem.quantity}`}</Text>
						) : (
							<>
								<IconButton
									variant="soft"
									disabled={lineItem.quantity === 0}
									onClick={reduceQuantity}
									size="1"
								>
									<Icons.Minus className="size-3" />
								</IconButton>
								<Text size="2" className="px-2 text-accent-11">
									{lineItem.quantity}
								</Text>
								<IconButton
									onClick={increaseQuantity}
									variant="soft"
									type="button"
									size="1"
								>
									<Icons.Plus className="size-3" />
								</IconButton>
							</>
						)}
					</Flex>
				</Flex>
				<Flex direction="column" align="end" position="relative">
					<Price
						amount={amount}
						currencyCode={currencyCode}
						className="font-bold"
					/>
					{!readonly && (
						<IconButton
							type="button"
							variant="soft"
							size="1"
							className="absolute bottom-0 right-0"
							onClick={async () => await deleteItem?.(lineItem.id)}
						>
							<Icons.Trash className="size-3" />
						</IconButton>
					)}
				</Flex>
			</Flex>
		</Card>
	);
};
export const LineItemSkeleton = () => {
	return (
		<Flex className="w-full flex gap-2">
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
		</Flex>
	);
};
