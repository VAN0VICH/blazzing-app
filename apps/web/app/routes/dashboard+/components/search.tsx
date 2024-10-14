import * as React from "react";

import { cn } from "@blazzing-app/ui";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandItem,
	CommandList,
} from "@blazzing-app/ui/command";
import { Icons } from "@blazzing-app/ui/icons";
import type { Customer, Order, Variant } from "@blazzing-app/validators/client";
import {
	Avatar,
	Badge,
	Dialog,
	Flex,
	Grid,
	Kbd,
	Skeleton,
	Text,
	TextField,
} from "@radix-ui/themes";
import { useNavigate } from "@remix-run/react";
import ImagePlaceholder from "~/components/image-placeholder";
import { HighlightedText } from "~/highlighted-text";
import { useDebounce } from "~/hooks/use-debounce";
import { toImageURL } from "~/utils/helpers";
import type {
	SearchWorkerRequest,
	SearchWorkerResponse,
} from "~/worker/search";
import { useDashboardStore } from "~/zustand/store";

export function DashboardSearchCombobox() {
	const navigate = useNavigate();
	const searchWorker = useDashboardStore((state) => state.searchWorker);
	const [query, setQuery] = React.useState("");
	const debouncedQuery = useDebounce(query, 300);
	const [searchResults, setSearchResults] = React.useState<
		{ variants: Variant[]; orders: Order[]; customers: Customer[] } | undefined
	>(undefined);
	const [loading, __] = React.useState(false);
	const [_, startTransition] = React.useTransition();
	const [isOpen, setIsOpen] = React.useState(false);

	React.useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setIsOpen((open) => !open);
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

	const onSelect = React.useCallback((callback: () => unknown) => {
		close();
		callback();
	}, []);
	React.useEffect(() => {
		if (debouncedQuery.length <= 0) {
			setSearchResults(undefined);
			return;
		}

		searchWorker?.postMessage({
			type: "DASHBOARD_SEARCH",
			payload: {
				query: debouncedQuery,
			},
		} satisfies SearchWorkerRequest);
	}, [debouncedQuery, searchWorker]);
	React.useEffect(() => {
		if (!searchWorker) return;

		const handleMessage = (event: MessageEvent) => {
			console.log("Message received in React component");
			const { type, payload } = event.data as SearchWorkerResponse;
			console.log("type", type);
			if (typeof type === "string" && type === "DASHBOARD_SEARCH") {
				startTransition(() => {
					const variants: Variant[] = [];
					const customers: Customer[] = [];
					const orders: Order[] = [];
					const variantIDs = new Set<string>();
					const customerIDs = new Set<string>();
					const orderIDs = new Set<string>();
					for (const p of payload) {
						if (p.id.startsWith("variant")) {
							if (!variantIDs.has(p.id)) {
								variants.push(p as Variant);
								variantIDs.add(p.id);
							}
						} else if (p.id.startsWith("user")) {
							if (!customerIDs.has(p.id)) {
								customers.push(p as Customer);
								customerIDs.add(p.id);
							}
						} else if (p.id.startsWith("order")) {
							if (!orderIDs.has(p.id)) {
								orders.push(p as Order);
								orderIDs.add(p.id);
							}
						}
					}
					setSearchResults({
						variants,
						orders,
						customers,
					});
				});
			}
		};

		searchWorker.addEventListener("message", handleMessage);

		// Test the worker
		searchWorker.postMessage({
			type: "DASHBOARD_SEARCH",
			payload: { query: "test" },
		});

		return () => {
			searchWorker.removeEventListener("message", handleMessage);
		};
	}, [searchWorker]);

	return (
		<Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
			<Dialog.Trigger>
				<Flex>
					<button
						type="button"
						className={cn(
							"hidden group relative lg:flex gap-3 h-[45px] items-center px-2 bg-component shadow-sm text-accent-11 hover:bg-accent-2 hover:border-accent-6 border border-border p-3 rounded-[7px] focus-visible:ring-accent-8 focus-visible:outline-none focus-visible:ring-2",
						)}
					>
						<Icons.MagnifyingGlassIcon aria-hidden="true" className="size-5 " />
						<Text size="3" className="font-freeman">
							Dashboard search
						</Text>
						<span className="sr-only">Search...</span>
						<Kbd title={"Command"} className="text-accent-11">
							{"⌘"} K
						</Kbd>
					</button>
					<button
						type="button"
						className="flex size-[45px] justify-center items-center bg-component shadow-sm text-accent-11 hover:bg-accent-2 hover:border-accent-6 border border-border p-3 rounded-[7px] focus-visible:ring-accent-8 focus-visible:outline-none focus-visible:ring-2 px-2 lg:hidden  hover:bg-slate-a-2"
					>
						<Icons.MagnifyingGlassIcon className="text-accent-11 hover:text-brand-9 size-6" />
					</button>
				</Flex>
			</Dialog.Trigger>
			<Dialog.Content className="p-0 rounded-[7px]" align="start">
				<Command className="w-full">
					<TextField.Root
						autoFocus
						placeholder="Search in dashboard.."
						className="rounded-t-[7px] rounded-b-none"
						size="3"
						variant="soft"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
					/>
					<CommandList>
						<CommandEmpty
							className={cn(
								loading ? "hidden" : "py-6 text-center text-slate-11",
							)}
						>
							Nothing found.
						</CommandEmpty>
						{loading ? (
							<div className="space-y-1 overflow-hidden px-1 py-2">
								<Skeleton className="h-4 w-10 rounded" />
								<Skeleton className="h-8 rounded-sm" />
								<Skeleton className="h-8 rounded-sm" />
							</div>
						) : (
							<>
								{searchResults && searchResults.variants.length > 0 && (
									<CommandGroup
										key="products"
										className="capitalize"
										heading="Products"
									>
										{searchResults.variants.map((variant) => {
											return (
												<CommandItem
													key={variant.id}
													className="p-2 h-18"
													value={variant.id}
													onSelect={() => {
														onSelect(() =>
															navigate(
																`/dashboard/products/${variant.productID}`,
															),
														);
														setQuery("");
														setIsOpen(false);
													}}
												>
													<div className="flex gap-3">
														<Avatar
															className="size-12"
															fallback={<ImagePlaceholder />}
															src={
																variant.thumbnail?.url ??
																toImageURL(
																	variant.thumbnail?.base64,
																	variant.thumbnail?.fileType,
																)
															}
														/>
														<div className="flex flex-col">
															<Flex justify="between" gap="2">
																<HighlightedText
																	searchTerm={query}
																	text={variant.title ?? ""}
																	className="font-bold text-base"
																/>
																<Badge color="purple">Product</Badge>
															</Flex>
															<HighlightedText
																searchTerm={query}
																text={variant.description ?? ""}
																className="line-clamp-2"
															/>
														</div>
													</div>
												</CommandItem>
											);
										})}
									</CommandGroup>
								)}
								{searchResults && searchResults.orders.length > 0 && (
									<CommandGroup
										key="orders"
										className="capitalize"
										heading="Orders"
									>
										{searchResults.orders.map((order) => {
											return (
												<CommandItem
													key={order.id}
													className="p-2 h-18"
													value={order.id}
													onSelect={() =>
														onSelect(() =>
															navigate(`/dashboard/orders/${order.id}`),
														)
													}
												>
													<div className="flex gap-3">
														<Icons.Order
															className="size-6 mt-2"
															aria-hidden="true"
														/>
														<div className="flex flex-col">
															<HighlightedText
																searchTerm={query}
																text={order.id ?? ""}
																className="font-bold text-base"
															/>
															<HighlightedText
																searchTerm={query}
																text={order.fullName ?? ""}
																className="line-clamp-2"
															/>
															<HighlightedText
																searchTerm={query}
																text={order.email ?? ""}
																className="line-clamp-2"
															/>
														</div>
													</div>
												</CommandItem>
											);
										})}
									</CommandGroup>
								)}

								{searchResults && searchResults.customers.length > 0 && (
									<CommandGroup
										key="customers"
										className="capitalize"
										heading="Customers"
									>
										{searchResults.customers.map((customer) => {
											return (
												<CommandItem
													key={customer.id}
													className="p-2 h-18"
													value={customer.id}
													onSelect={() =>
														onSelect(() =>
															navigate(`/dashboard/customers/${customer.id}`),
														)
													}
												>
													<Flex gap="3">
														<Icons.Product
															className="size-6 mt-2"
															aria-hidden="true"
														/>
														<Grid>
															<HighlightedText
																searchTerm={query}
																text={customer.user?.username ?? "Anonym"}
																className="font-bold text-base"
															/>
															<HighlightedText
																searchTerm={query}
																text={customer.user?.fullName ?? ""}
																className="line-clamp-2"
															/>
															<HighlightedText
																searchTerm={query}
																text={customer.email ?? ""}
																className="line-clamp-2"
															/>
														</Grid>
													</Flex>
												</CommandItem>
											);
										})}
									</CommandGroup>
								)}
							</>
						)}
					</CommandList>
				</Command>
			</Dialog.Content>
		</Dialog.Root>
	);
}
