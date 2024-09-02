import { cn } from "@blazzing-app/ui";
import type { Product } from "@blazzing-app/validators/client";
import { Avatar, Box, Flex, Heading } from "@radix-ui/themes";
import { Link } from "@remix-run/react";
import Price from "~/components/price";

const ProductCard = ({
	product,
}: {
	product: Product;
}) => {
	return (
		<Link
			to={`/marketplace/products/${product.baseVariant.handle}`}
			prefetch="viewport"
			unstable_viewTransition={true}
			preventScrollReset={true}
		>
			<Box
				position="relative"
				width="100%"
				height="100%"
				className={cn(
					"flex flex-col border lg:hover:scale-[103%] lg:transition-all lg:ease-in-out lg:duration-200 min-h-28 min-w-28 col-span-1 row-span-1 cursor-pointer border-border rounded-lg overflow-hidden aspect-square",
					{
						"col-span-2 row-span-2": (product.score ?? 0) > 1,
					},
				)}
			>
				<Avatar fallback="F" />
				<Flex
					position="absolute"
					inset="0"
					direction="column"
					justify="between"
					p="2"
					className="bg-gradient-to-b from-transparent to-black/30"
				>
					<span className="self-end bg-brand-3 text-brand-9 font-freeman text-sm md:text-base border border-brand-9 rounded-lg p-1">
						{product.baseVariant?.prices?.[0]!.amount &&
							product.baseVariant?.prices?.[0] && (
								<Price
									className="text-xs md:text-sm font-freeman flex-none text-brand-9"
									amount={product.baseVariant?.prices?.[0]!.amount}
									currencyCode={product.baseVariant?.prices?.[0]!.currencyCode}
									currencyCodeClassName="hidden @[275px]/label:inline"
								/>
							)}
					</span>
					<Box>
						<Heading className="font-freeman text-sm line-clamp-1 text-ellipsis overflow-hidden text-white">
							{product.baseVariant.title}
						</Heading>
						<p
							className={cn("text-xs text-gray-200 line-clamp-2 mt-1", {
								hidden: product.score ?? 0 < 1,
							})}
						>
							{product.baseVariant.description ?? ""}
						</p>
					</Box>
				</Flex>
			</Box>
		</Link>
	);
};

export { ProductCard };
