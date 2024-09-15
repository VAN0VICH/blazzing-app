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
import React from "react";
import { PageHeader } from "../components/page-header";
import { CustomersTable } from "./customers-table/table";
import { customer } from "~/temp/mock-entities";

export default function CustomersPage() {
	return (
		<Flex
			justify="center"
			p={{ initial: "2", sm: "3" }}
			pb={{ sm: "100px", md: "3" }}
		>
			<Flex justify="center" width="100%" direction="column" maxWidth="1300px">
				<Grid pb={{ initial: "2", sm: "3" }}>
					<Flex direction={{ initial: "column", md: "row" }} gap="3">
						<Box className="w-full lg:w-8/12">
							<Box className="w-full bg-component border border-border rounded-[7px]">
								<PageHeader
									title="Customers"
									className="p-4 justify-center border-b border-border md:justify-start"
								/>
								<CustomersTable customers={[customer]} />
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
	const customers = [] as Customer[];
	const isInitialized = true;
	return (
		<Card className="w-full max-w-sm max-h-[64vh] min-w-[320px] sticky top-10 shadow-none p-0">
			<Heading size="3" className="text-accent-11">
				New customers
			</Heading>
			<ScrollArea className="h-[60vh]">
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
						<Avatar fallback="F" />
						<Grid gap="1">
							<Text>{customer.user?.username ?? "Unknown"}</Text>
							<Text>{customer.email}</Text>
						</Grid>
						<Heading className="ml-auto text-accent-11 font-medium">
							+$1,999.00
						</Heading>
					</Flex>
				))}
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
			className={cn("max-w-sm p-4", {
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
