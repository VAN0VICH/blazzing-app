import { Icons } from "@blazzing-app/ui/icons";
import type { Order } from "@blazzing-app/validators/client";
import { Box, Flex, Heading } from "@radix-ui/themes";
import debounce from "lodash.debounce";
import React, { useState, useTransition } from "react";
import { ClientOnly } from "remix-utils/client-only";
import { useWindowSize } from "~/hooks/use-window-size";
import type {
	SearchWorkerRequest,
	SearchWorkerResponse,
} from "~/worker/search";
import { useDashboardStore } from "~/zustand/store";
import { OrderPreview, OrderPreviewMobile } from "./order-preview";
import { OrdersTable } from "./orders-table/table";

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
								size="6"
								className="p-4 justify-center font-freeman text-accent-11 border-b border-border md:justify-start"
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
									Preview
								</Heading>
							</Flex>
						)}
					</section>
				</Flex>
			</Flex>
		</Flex>
	);
}
