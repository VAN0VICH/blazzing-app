import type { Customer } from "@blazzing-app/validators/client";
import {
	Avatar,
	Box,
	Card,
	Flex,
	Grid,
	Heading,
	ScrollArea,
	Skeleton,
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
									size="6"
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
				<Heading size="6" className="text-accent-11 font-freeman">
					New customers
				</Heading>
			</Box>
			<ScrollArea className="h-[60vh]">
				<Box p="4">
					<Grid gap="2">
						{!isInitialized &&
							Array.from({ length: 3 }).map((_, i) => (
								<Flex align="center" justify="between" key={i} gap="2">
									<Flex gap="1">
										<Skeleton className="hidden h-9 w-9 rounded-[7px] sm:flex" />
										<Grid>
											<Skeleton className="w-[100px] h-4" />
											<Skeleton className="w-[150px] h-4" />
										</Grid>
									</Flex>

									<Skeleton className="w-[100px] h-4" />
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
								<Heading
									size="4"
									className="ml-auto text-accent-11 font-medium"
								>
									+$1,999.00
								</Heading>
							</Flex>
						))}
					</Grid>
				</Box>
			</ScrollArea>
		</Card>
	);
}
