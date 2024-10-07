import { cn } from "@blazzing-app/ui";
import type { Customer } from "@blazzing-app/validators/client";
import {
	Avatar,
	Box,
	Card,
	Flex,
	Grid,
	Heading,
	Progress,
	ScrollArea,
	Skeleton,
	Strong,
	Text,
} from "@radix-ui/themes";
import debounce from "lodash.debounce";
import React from "react";
import ImagePlaceholder from "~/components/image-placeholder";
import type {
	SearchWorkerRequest,
	SearchWorkerResponse,
} from "~/worker/search";
import { useDashboardStore } from "~/zustand/store";
import { CustomersTable } from "./customers-table/table";

export default function CustomersPage() {
	const customers = useDashboardStore((state) => state.customers);
	const searchWorker = useDashboardStore((state) => state.searchWorker);
	const [searchResults, setSearchResults] = React.useState<
		Customer[] | undefined
	>(undefined);
	const [_, startTransition] = React.useTransition();

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const onSearch = React.useCallback(
		debounce((value: string) => {
			if (value === "") {
				setSearchResults(undefined);
				return;
			}
			searchWorker?.postMessage({
				type: "CUSTOMER_SEARCH",
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
				if (typeof type === "string" && type === "CUSTOMER_SEARCH") {
					startTransition(() => {
						const customers: Customer[] = [];
						const customerIDs = new Set<string>();
						for (const item of payload) {
							if (item.id.startsWith("user")) {
								if (customerIDs.has(item.id)) continue;
								customers.push(item as Customer);
								customerIDs.add(item.id);
							}
						}
						setSearchResults(customers);
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
				<Grid pb={{ initial: "2", sm: "3" }}>
					<Flex direction={{ initial: "column", md: "row" }} gap="3">
						<Box className="w-full lg:w-8/12">
							<Box className="w-full bg-component border border-border rounded-[7px]">
								<Heading
									size="5"
									className="p-4 font-freeman text-accent-11 justify-center border-b border-border md:justify-start"
								>
									Customers
								</Heading>
								<CustomersTable
									customers={searchResults ?? customers ?? []}
									onSearch={onSearch}
								/>
							</Box>
						</Box>
						<Box className="w-full lg:w-4/12 lg:block hidden relative">
							<CustomersInfo />
						</Box>
					</Flex>
				</Grid>
			</Flex>
		</Flex>
	);
}

function CustomersInfo() {
	const customers = useDashboardStore((state) => state.customers);
	const isInitialized = useDashboardStore((state) => state.isInitialized);
	return (
		<Card className="w-full max-w-sm max-h-[64vh] min-w-[320px] sticky top-10 shadow-none p-0">
			<Box p="4" className="border-b border-border">
				<Heading size="5" className="text-accent-11 font-freeman">
					New customers
				</Heading>
			</Box>
			<ScrollArea className="h-[60vh]">
				<Box p="4">
					{!isInitialized &&
						Array.from({ length: 5 }).map((_, i) => (
							<Flex align="center" gap="" key={i}>
								<Skeleton className="hidden h-9 w-9 rounded-full sm:flex" />
								<Grid gap="1">
									<Skeleton className="w-[150px] h-[10px]" />
								</Grid>

								<Skeleton className="w-[100px] h-[10px]" />
							</Flex>
						))}
					{customers.map((customer) => (
						<Flex align="center" gap="2" key={customer.id}>
							<Avatar
								fallback={<ImagePlaceholder />}
								className="border border-accent-5"
								src={
									typeof customer.user?.avatar === "string"
										? customer.user.avatar
										: customer.user?.avatar?.url
								}
							/>
							<Grid gap="1">
								<Text className="text-accent-11 font-freeman">
									{customer.user?.username ?? "Unknown"}
								</Text>
								<Text>{customer.email}</Text>
							</Grid>
							<Heading size="4" className="ml-auto text-accent-11 font-medium">
								+$1,999.00
							</Heading>
						</Flex>
					))}
				</Box>
			</ScrollArea>
		</Card>
	);
}

function Stat({
	type,
	customers,
}: { type: "daily" | "weekly" | "monthly"; customers: Customer[] }) {
	const today = new Date().toISOString().split("T")[0]!;

	// Utility function to calculate percentage increase
	const calculatePercentageIncrease = (current: number, previous: number) => {
		if (previous === 0) return current > 0 ? 100 : 0;
		return ((current - previous) / previous) * 100;
	};

	// Aggregate data for required ranges
	const todayCustomers = React.useMemo(
		() => aggregateDataForRange(customers, today, today),
		[customers, today],
	);
	const yesterdayCustomers = React.useMemo(
		() =>
			aggregateDataForRange(customers, getDateNDaysAgo(1), getDateNDaysAgo(1)),
		[customers],
	);
	const weekAgoCustomers = React.useMemo(
		() => aggregateDataForRange(customers, getDateNDaysAgo(6), today),
		[customers, today],
	);
	const lastWeekCustomers = React.useMemo(
		() =>
			aggregateDataForRange(customers, getDateNDaysAgo(13), getDateNDaysAgo(7)),
		[customers],
	);
	const monthAgoCustomers = React.useMemo(
		() => aggregateDataForRange(customers, getDateNDaysAgo(29), today),
		[customers, today],
	);
	const lastMonthCustomers = React.useMemo(
		() =>
			aggregateDataForRange(
				customers,
				getDateNDaysAgo(59),
				getDateNDaysAgo(30),
			),
		[customers],
	);

	// Get amount based on type
	const getNumber = (type: "daily" | "weekly" | "monthly") => {
		switch (type) {
			case "daily":
				return todayCustomers;
			case "weekly":
				return weekAgoCustomers;
			case "monthly":
				return monthAgoCustomers;
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
				return calculatePercentageIncrease(todayCustomers, yesterdayCustomers);
			case "weekly":
				return calculatePercentageIncrease(weekAgoCustomers, lastWeekCustomers);
			case "monthly":
				return calculatePercentageIncrease(
					monthAgoCustomers,
					lastMonthCustomers,
				);
			default:
				return 0;
		}
	};

	const percentageIncrease = getPercentageIncreaseFromLast(type);

	return (
		<Card
			className={cn("max-w-sm p-0", {
				"hidden sm:block": type === "monthly",
			})}
		>
			<Text>
				{type === "daily" ? "Daily" : type === "weekly" ? "Weekly" : "Monthly"}{" "}
				<Strong className="text-accent-11">new customers</Strong>
			</Text>
			<Heading className="text-accent-11">{`${getNumber(type)}`}</Heading>
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

const getDateNDaysAgo = (n: number): string => {
	const date = new Date();
	date.setDate(date.getDate() - n);
	return date.toISOString().split("T")[0]!;
};

const aggregateDataForRange = (
	customers: Customer[],
	startDate: string,
	endDate: string,
): number => {
	return customers
		.filter((customer) => {
			const joinedDate = customer.createdAt.split("T")[0]!;
			return joinedDate >= startDate && joinedDate <= endDate;
		})
		.reduce((acc) => {
			acc++;
			return acc;
		}, 0);
};
