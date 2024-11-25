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
import type { Variant } from "../../../../packages/validators/src/store-entities";
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
import { useLocation, useNavigate } from "@remix-run/react";
import { HighlightedText } from "~/highlighted-text";
import { useDebounce } from "~/hooks/use-debounce";
import type {
	SearchWorkerRequest,
	SearchWorkerResponse,
} from "~/worker/search";
import { useGlobalSearch } from "~/zustand/store";
import ImagePlaceholder from "./image-placeholder";
import { toImageURL } from "~/utils/helpers";

export function GlobalSearchCombobox() {
	const navigate = useNavigate();
	const searchWorker = useGlobalSearch((state) => state.globalSearchWorker);

	const [query, setQuery] = React.useState("");
	const debouncedQuery = useDebounce(query, 300);
	const [searchResults, setSearchResults] = React.useState<
		{ variants: Variant[] } | undefined
	>(undefined);
	const [loading, __] = React.useState(false);
	const [_, startTransition] = React.useTransition();
	const [isOpen, setIsOpen] = React.useState(false);
	const location = useLocation();
	const splitPath = location.pathname.split("/");
	const mainPath = splitPath[1];

	React.useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (
				e.key === "k" &&
				(e.metaKey || e.ctrlKey) &&
				mainPath !== "dashboard"
			) {
				e.preventDefault();
				setIsOpen((open) => !open);
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [mainPath]);

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
			type: "GLOBAL_SEARCH",
			payload: {
				query: debouncedQuery,
			},
		} satisfies SearchWorkerRequest);
	}, [debouncedQuery, searchWorker]);
	React.useEffect(() => {
		if (!searchWorker) return;

		const handleMessage = (event: MessageEvent) => {
			const { type, payload } = event.data as SearchWorkerResponse;
			if (typeof type === "string" && type === "GLOBAL_SEARCH") {
				startTransition(() => {
					const variants: Variant[] = [];
					const variantIDs = new Set<string>();
					for (const p of payload) {
						if (p.id.startsWith("variant")) {
							if (!variantIDs.has(p.id)) {
								variants.push(p as Variant);
								variantIDs.add(p.id);
							}
						}
					}
					setSearchResults({
						variants,
					});
				});
			}
		};

		searchWorker.addEventListener("message", handleMessage);

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
							"hidden dark:bg-gray-3 items-center font-freeman dark:shadow-accent-2 group relative h-[45px] lg:flex gap-3 bg-component shadow-sm text-accent-11 hover:bg-accent-2 hover:border-accent-6 border border-border p-3 rounded-[7px] focus-visible:ring-accent-8 focus-visible:outline-none focus-visible:ring-2",
						)}
					>
						<Icons.MagnifyingGlassIcon aria-hidden="true" className="size-5" />
						<Text size="3" className="font-freeman">
							Search
						</Text>
						<span className="sr-only">Search...</span>
						<Kbd title={"Command"} className="text-accent-11">
							{"⌘"} K
						</Kbd>
					</button>
				</Flex>
			</Dialog.Trigger>
			<Dialog.Content className="p-0 rounded-[7px]" align="start">
				<Command className="w-full">
					<TextField.Root
						autoFocus
						placeholder="Global search"
						className="rounded-t-[7px] h-14 rounded-b-none"
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
							<Grid className="space-y-1 overflow-hidden px-1 py-2">
								<Skeleton className="h-4 w-10 rounded" />
								<Skeleton className="h-8 rounded-sm" />
								<Skeleton className="h-8 rounded-sm" />
							</Grid>
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
																`/marketplace/products/${variant.handle}`,
															),
														);
														setQuery("");
														setIsOpen(false);
													}}
												>
													<Flex gap="3">
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
														<Grid>
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
