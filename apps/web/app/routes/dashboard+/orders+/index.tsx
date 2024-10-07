import { cn } from "@blazzing-app/ui";
import { Icons } from "@blazzing-app/ui/icons";
import { toast } from "@blazzing-app/ui/toast";
import { cartSubtotal } from "@blazzing-app/utils";
import type { Order } from "@blazzing-app/validators/client";
import {
	Box,
	Card,
	Flex,
	Heading,
	Progress,
	Strong,
	Text,
} from "@radix-ui/themes";
import { Effect, pipe } from "effect";
import React, { useState, useTransition } from "react";
import { ClientOnly } from "remix-utils/client-only";
import { useWindowSize } from "~/hooks/use-window-size";
import { useDashboardStore } from "~/zustand/store";
import { OrderPreview, OrderPreviewMobile } from "./order-preview";
import { OrdersTable } from "./orders-table/table";
import debounce from "lodash.debounce";
import type {
	SearchWorkerRequest,
	SearchWorkerResponse,
} from "~/worker/search";

export default function Orders() {
	const orders = useDashboardStore((state) => state.orders);
	const [searchResults, setSearchResults] = useState<Order[] | undefined>(
		undefined,
	);
	const searchWorker = useDashboardStore((state) => state.searchWorker);
	const [_, startTransition] = useTransition();

	const windowSize = useWindowSize(100);

	const [orderID, _setOrderID] = React.useState<string | undefined>(undefined);
	const [opened, setOpened] = React.useState(false);
	const setOrderID = (id: string | undefined) => {
		_setOrderID(id);
		if (id) return setOpened(true);
		setOpened(false);
	};
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const onSearch = React.useCallback(
		debounce((value: string) => {
			if (value === "") {
				setSearchResults(undefined);
				return;
			}
			searchWorker?.postMessage({
				type: "ORDER_SEARCH",
				payload: {
					query: value,
				},
			} satisfies SearchWorkerRequest);
		}, 300),
		[searchWorker],
	);
	React.useEffect(() => {
		if (searchWorker) {
			searchWorker.onmessage = (event: MessageEvent) => {
				const { type, payload } = event.data as SearchWorkerResponse;
				if (typeof type === "string" && type === "ORDER_SEARCH") {
					startTransition(() => {
						const orders: Order[] = [];
						const orderIDs = new Set<string>();
						for (const item of payload) {
							if (item.id.startsWith("order")) {
								if (orderIDs.has(item.id)) continue;
								orders.push(item as Order);
								orderIDs.add(item.id);
							}
						}
						setSearchResults(orders);
					});
				}
			};
		}
	}, [searchWorker]);
	return (
		<Flex
			justify="center"
			p={{ initial: "2", sm: "3" }}
			className="pb-20 lg:pb-3"
		>
			<Flex justify="center" width="100%" direction="column" maxWidth="1700px">
				<Flex
					direction={{ initial: "column", md: "row" }}
					justify="center"
					gap={{ initial: "2", sm: "3" }}
					className="flex flex-col justify-center gap-2 sm:gap-3 lg:flex-row"
				>
					<Box className="w-full xl:w-8/12">
						<Box className="bg-component border border-border rounded-[7px]">
							<Heading
								size="5"
								className="p-4 justify-center text-accent-11 border-b border-border md:justify-start"
							>
								Orders
							</Heading>
							<OrdersTable
								orders={searchResults ?? orders ?? []}
								orderID={orderID}
								setOrderID={setOrderID}
								onSearch={onSearch}
							/>
						</Box>
					</Box>
					<section className="w-full lg:w-4/12 relative lg:flex flex-col items-start hidden">
						{orderID ? (
							<>
								<OrderPreview orderID={orderID} />
								<ClientOnly>
									{() =>
										windowSize.width < 1024 && (
											<OrderPreviewMobile
												orderID={orderID}
												opened={opened}
												setOpened={setOpened}
											/>
										)
									}
								</ClientOnly>
							</>
						) : (
							<Flex
								justify="center"
								align="center"
								position="sticky"
								top="9"
								className="h-[50rem] w-[25rem] border rounded-[7px] bg-component shadow-inner hover:bg-slate-2 hover:bg-slate-3 border-border  "
							>
								<Icons.Order className="text-accent-8 pr-2 size-8" />
								<Heading className="   text-accent-8" size="4">
									Order preview
								</Heading>
							</Flex>
						)}
					</section>
				</Flex>
			</Flex>
		</Flex>
	);
}

function Revenue({
	type,
	orders,
}: { type: "daily" | "weekly" | "monthly"; orders: Order[] }) {
	const today = new Date().toISOString().split("T")[0]!;

	// Utility function to calculate percentage increase
	const calculatePercentageIncrease = (current: number, previous: number) => {
		if (previous === 0) return current > 0 ? 100 : 0;
		return ((current - previous) / previous) * 100;
	};

	// Aggregate data for required ranges
	const todayOrders = React.useMemo(
		() => aggregateDataForRange(orders, today, today),
		[orders, today],
	);
	const yesterdayOrders = React.useMemo(
		() => aggregateDataForRange(orders, getDateNDaysAgo(1), getDateNDaysAgo(1)),
		[orders],
	);
	const weekAgoOrders = React.useMemo(
		() => aggregateDataForRange(orders, getDateNDaysAgo(6), today),
		[orders, today],
	);
	const lastWeekOrders = React.useMemo(
		() =>
			aggregateDataForRange(orders, getDateNDaysAgo(13), getDateNDaysAgo(7)),
		[orders],
	);
	const monthAgoOrders = React.useMemo(
		() => aggregateDataForRange(orders, getDateNDaysAgo(29), today),
		[orders, today],
	);
	const lastMonthOrders = React.useMemo(
		() =>
			aggregateDataForRange(orders, getDateNDaysAgo(59), getDateNDaysAgo(30)),
		[orders],
	);

	// Get amount based on type
	const getAmount = (type: "daily" | "weekly" | "monthly") => {
		switch (type) {
			case "daily":
				return todayOrders.totalSales;
			case "weekly":
				return weekAgoOrders.totalSales;
			case "monthly":
				return monthAgoOrders.totalSales;
			default:
				return 0;
		}
	};

	// Calculate percentage increase based on type
	const getPercentageIncreaseFromLast = (
		type: "daily" | "weekly" | "monthly",
	) => {
		switch (type) {
			case "daily":
				return calculatePercentageIncrease(
					todayOrders.totalSales,
					yesterdayOrders.totalSales,
				);
			case "weekly":
				return calculatePercentageIncrease(
					weekAgoOrders.totalSales,
					lastWeekOrders.totalSales,
				);
			case "monthly":
				return calculatePercentageIncrease(
					monthAgoOrders.totalSales,
					lastMonthOrders.totalSales,
				);
			default:
				return 0;
		}
	};

	const percentageIncrease = getPercentageIncreaseFromLast(type);

	return (
		<Card
			className={cn("max-w-sm p-4", {
				"hidden lg:block": type === "monthly",
			})}
		>
			<Text>
				{type === "daily" ? "Daily" : type === "weekly" ? "Weekly" : "Monthly"}{" "}
				<Strong className="text-accent-11">sales</Strong>
			</Text>
			<Heading
				className="text-accent-11"
				size="8"
			>{`$${getAmount(type)}`}</Heading>
			<Text size="1" color="gray">
				{percentageIncrease >= 0 ? "+" : ""}
				{percentageIncrease.toFixed(2)}% from last{" "}
				{type === "daily" ? "day" : type === "weekly" ? "week" : "month"}
			</Text>
			<Progress
				value={percentageIncrease}
				aria-label={`${percentageIncrease.toFixed(2)}% increase`}
			/>
		</Card>
	);
}
function Numbers({
	type,
	orders,
}: { type: "daily" | "weekly" | "monthly"; orders: Order[] }) {
	const today = new Date().toISOString().split("T")[0]!;

	// Utility function to calculate percentage increase
	const calculatePercentageIncrease = (current: number, previous: number) => {
		if (previous === 0) return current > 0 ? 100 : 0;
		return ((current - previous) / previous) * 100;
	};

	// Aggregate data for required ranges
	const todayOrders = React.useMemo(
		() => aggregateDataForRange(orders, today, today),
		[orders, today],
	);
	const yesterdayOrders = React.useMemo(
		() => aggregateDataForRange(orders, getDateNDaysAgo(1), getDateNDaysAgo(1)),
		[orders],
	);
	const weekAgoOrders = React.useMemo(
		() => aggregateDataForRange(orders, getDateNDaysAgo(6), today),
		[orders, today],
	);
	const lastWeekOrders = React.useMemo(
		() =>
			aggregateDataForRange(orders, getDateNDaysAgo(13), getDateNDaysAgo(7)),
		[orders],
	);
	const monthAgoOrders = React.useMemo(
		() => aggregateDataForRange(orders, getDateNDaysAgo(29), today),
		[orders, today],
	);
	const lastMonthOrders = React.useMemo(
		() =>
			aggregateDataForRange(orders, getDateNDaysAgo(59), getDateNDaysAgo(30)),
		[orders],
	);

	// Get amount based on type
	const getNumber = (type: "daily" | "weekly" | "monthly") => {
		switch (type) {
			case "daily":
				return todayOrders.numOrders;
			case "weekly":
				return weekAgoOrders.numOrders;
			case "monthly":
				return monthAgoOrders.numOrders;
			default:
				return 0;
		}
	};

	// Calculate percentage increase based on type
	const getPercentageIncreaseFromLast = (
		type: "daily" | "weekly" | "monthly",
	) => {
		switch (type) {
			case "daily":
				return calculatePercentageIncrease(
					todayOrders.numOrders,
					yesterdayOrders.numOrders,
				);
			case "weekly":
				return calculatePercentageIncrease(
					weekAgoOrders.numOrders,
					lastWeekOrders.numOrders,
				);
			case "monthly":
				return calculatePercentageIncrease(
					monthAgoOrders.numOrders,
					lastMonthOrders.numOrders,
				);
			default:
				return 0;
		}
	};

	const percentageIncrease = getPercentageIncreaseFromLast(type);

	return (
		<Card
			className={cn("max-w-sm p-4", {
				"hidden lg:block": type === "monthly",
			})}
		>
			<Text weight="medium">
				{type === "daily" ? "Daily" : type === "weekly" ? "Weekly" : "Monthly"}
				<Strong className="text-accent-11"> # orders</Strong>
			</Text>
			<Heading size="8" className="text-accent-11">
				{getNumber(type)}{" "}
			</Heading>
			<Text color="gray" size="1">
				{percentageIncrease >= 0 ? "+" : ""}
				{percentageIncrease.toFixed(2)}% from last{" "}
				{type === "daily" ? "day" : type === "weekly" ? "week" : "month"}
			</Text>
			<Progress
				value={percentageIncrease}
				aria-label={`${percentageIncrease.toFixed(2)}% increase`}
			/>
		</Card>
	);
}

const getDateNDaysAgo = (n: number): string => {
	const date = new Date();
	date.setDate(date.getDate() - n);
	return date.toISOString().split("T")[0]!;
};

const aggregateDataForRange = (
	orders: Order[],
	startDate: string,
	endDate: string,
): { numOrders: number; totalSales: number } => {
	return orders
		.filter((order) => {
			const orderDate = order.createdAt.split("T")[0]!;
			return orderDate >= startDate && orderDate <= endDate;
		})
		.reduce(
			(acc, order) => {
				acc.numOrders++;
				acc.totalSales += Effect.runSync(
					cartSubtotal(order.items, order).pipe(
						Effect.catchTags({
							PriceNotFound: (error) =>
								pipe(
									Effect.succeed(-1),
									Effect.zipLeft(Effect.sync(() => toast.error(error.message))),
								),
						}),
					),
				);
				return acc;
			},
			{ numOrders: 0, totalSales: 0 },
		);
};
