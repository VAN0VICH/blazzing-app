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
import type { Variant } from "@blazzing-app/validators/client";
import {
	Box,
	Button,
	Dialog,
	Flex,
	Grid,
	IconButton,
	Kbd,
	Skeleton,
	Text,
	TextField,
} from "@radix-ui/themes";
import { useLocation, useNavigate } from "@remix-run/react";
import { HighlightedText } from "~/highlighted-text";
import { useDebounce } from "~/hooks/use-debounce";

export function GlobalSearchCombobox() {
	const navigate = useNavigate();

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

	return (
		<Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
			<Dialog.Trigger>
				<Flex>
					<Button
						size="3"
						variant={"surface"}
						className={cn(
							"hidden group relative lg:flex gap-3 items-center px-2",
						)}
					>
						<Icons.MagnifyingGlassIcon
							aria-hidden="true"
							className="size-5 text-slate-11 "
						/>
						<Text size="2">Search</Text>
						<span className="sr-only">Search...</span>
						<Kbd title={"Command"} className=" text-slate-11 border-border ">
							{"⌘"} K
						</Kbd>
					</Button>
					<IconButton
						variant="ghost"
						type="button"
						className="flex px-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring lg:hidden rounded-lg hover:bg-slate-a-2 p-2"
					>
						<Icons.MagnifyingGlassIcon className="text-slate-11 hover:text-brand-9 size-6" />
					</IconButton>
				</Flex>
			</Dialog.Trigger>
			<Dialog.Content className="p-0 rounded-[7px]" align="start">
				<Command className="w-full">
					<TextField.Root
						autoFocus
						placeholder="Global search"
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
													className="p-2"
													value={variant.id}
													onSelect={() =>
														// onSelect(() =>
														// 	navigate(
														// 		`/marketplace/products/${variant.handle}`,
														// 	),
														// )
														{}
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
																text={variant.title ?? ""}
																className="font-bold text-base"
															/>
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
