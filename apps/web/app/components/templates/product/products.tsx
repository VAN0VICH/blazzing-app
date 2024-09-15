import { cn } from "@blazzing-app/ui";
import { Icons } from "@blazzing-app/ui/icons";
import { LoadingSpinner } from "@blazzing-app/ui/loading";
import { ToggleGroup, ToggleGroupItem } from "@blazzing-app/ui/toggle-group";
import type { Product } from "@blazzing-app/validators/client";
import { Avatar, Badge, Box, Button, Flex, Heading } from "@radix-ui/themes";
import React from "react";
import Price from "~/components/price";
import { useUserPreferences } from "~/hooks/use-user-preferences";
import { product } from "~/temp/mock-entities";
interface Pin {
	id: number;
	imageUrl: string;
	title: string;
	height: number;
}

const generatePins = (count: number): Pin[] => {
	const titles = [
		"Cozy living room ideas",
		"Delicious vegan recipes",
		"DIY craft projects",
		"Exotic travel destinations",
		"Fashion inspiration for summer",
		"Modern home decor trends",
		"Fitness motivation tips",
		"Contemporary art and design",
		"Gardening ideas for small spaces",
		"Minimalist lifestyle hacks",
		"Outdoor adventure photography",
		"Healthy meal prep ideas",
		"Vintage fashion finds",
		"Sustainable living tips",
		"Creative writing prompts",
		"Yoga and meditation spaces",
		"Unique wedding inspiration",
		"Urban sketching techniques",
		"Colorful hair trends",
		"Upcycled furniture projects",
	];

	return Array.from({ length: count }, (_, i) => ({
		id: i + 1,
		imageUrl: `/placeholder.svg?height=${Math.floor(Math.random() * (500 - 200 + 1)) + 200}&width=300`,
		title: titles[i % titles.length]!,
		height: Math.floor(Math.random() * (500 - 200 + 1)) + 200,
	}));
};

const initialPins: Pin[] = generatePins(50);
const Products = ({ isAuction = false }: { isAuction?: boolean }) => {
	const [pins, setPins] = React.useState<Pin[]>(initialPins);
	const products: Product[] = [
		product,
		{ ...product, id: "2131" },
		{ ...product, id: "12321" },
	];
	const isInitialized = true;
	console.log("products", products);
	const { accentColor } = useUserPreferences();

	if (!isInitialized)
		return (
			<section className="flex flex-col gap-2">
				<div className="w-full h-screen flex justify-center">
					<LoadingSpinner />
				</div>
			</section>
		);
	return (
		<Flex direction="column" gap="2">
			{/* <div className="grid md:grid-cols-5 sm:grid-cols-4 gap-1 grid-cols-2 min-[350px]:grid-cols-3 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 grid-rows-12">
				{products.map((product) => (
					<ProductCard key={product.id} product={product} />
				))}
			</div> */}
			<div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4">
				{pins.map((pin) => (
					<div key={pin.id} className="mb-4 break-inside-avoid">
						<div className="relative group ">
							<Avatar
								fallback="F"
								src={pin.imageUrl}
								alt={pin.title}
								className="w-full cursor-pointer"
								style={{ height: `${pin.height}px`, objectFit: "cover" }}
							/>
							<div
								className={cn(
									"hidden md:flex absolute gap-2 cursor-pointer inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 items-center justify-center",
									{
										"hidden md:hidden": isAuction,
									},
								)}
							>
								<Button>Add to cart</Button>
							</div>

							<div className="absolute top-2 right-2 scale-75 md:scale-90 lg:scale-100">
								{!isAuction ? (
									<Price
										amount={12}
										currencyCode="AUD"
										className="border font-bold max-h-[30px] flex items-center justify-center text-sm p-1 bg-accent-3 border-accent-9 text-accent-11"
									/>
								) : (
									<Badge variant="solid" size="3" color={accentColor ?? "ruby"}>
										Live
									</Badge>
								)}
							</div>
						</div>
						<Flex justify="between" gap="2" pt="2" align="center">
							<Flex gap="2" align="center">
								<Avatar fallback="f" className="size-8" />
								<Heading
									size="2"
									className="overflow-hidden text-ellipsis line-clamp-1"
								>
									{pin.title}
								</Heading>
							</Flex>
							<Flex gap="2">
								{!isAuction && (
									<ToggleGroup type="single">
										<ToggleGroupItem
											value="save"
											className="w-full aspect-square size-8 text-sm flex gap-2"
											onClick={(e) => e.stopPropagation()}
										>
											<Icons.Bookmark className="min-w-[16px] text-accent-11" />
										</ToggleGroupItem>
									</ToggleGroup>
								)}
							</Flex>
						</Flex>
					</div>
				))}
			</div>
		</Flex>
	);
};
export { Products };
