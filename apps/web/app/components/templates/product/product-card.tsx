import { cn } from "@blazzing-app/ui";
import type { Product } from "@blazzing-app/validators/client";
import { Avatar, Box, Card, Flex, Grid, Heading } from "@radix-ui/themes";
import Price from "~/components/price";

const ProductCard = ({
	product,
	isDashboard = false,
}: {
	product: Product;
	isDashboard?: boolean;
}) => {
	return (
		<Card
			className={cn(
				"flex relative flex-col lg:hover:scale-[103%] lg:transition-all lg:ease-in-out lg:duration-200 min-h-28 min-w-28 col-span-1 row-span-1 cursor-pointer overflow-hidden aspect-square",
				{
					"col-span-2 row-span-2": (product.score ?? 0) > 1,
				},
			)}
		>
			<Flex
				position="absolute"
				inset="0"
				direction="column"
				justify="between"
				p="2"
				className="bg-gradient-to-b from-transparent to-black/30"
			>
				<span className="self-end bg-accent-3 text-accent-10    text-sm md:text-base border border-accent-9 p-1">
					{product.baseVariant?.prices?.[0]!.amount &&
						product.baseVariant?.prices?.[0] && (
							<Price
								className="text-xs md:text-sm    flex-none"
								amount={product.baseVariant?.prices?.[0]!.amount}
								currencyCode={product.baseVariant?.prices?.[0]!.currencyCode}
								currencyCodeClassName="hidden @[275px]/label:inline"
							/>
						)}
				</span>
				<Grid gap="1">
					{!isDashboard && <Avatar fallback="F" />}
					<Heading className="   text-sm line-clamp-1 text-ellipsis overflow-hidden text-white">
						{product.baseVariant.title}
					</Heading>
					<p
						className={cn("text-xs text-gray-200 line-clamp-2 mt-1", {
							hidden: product.score ?? 0 < 1,
						})}
					>
						{product.baseVariant.description ?? ""}
					</p>
				</Grid>
			</Flex>
		</Card>
	);
};

export { ProductCard };
