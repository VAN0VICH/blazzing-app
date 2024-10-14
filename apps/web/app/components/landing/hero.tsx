import { cn } from "@blazzing-app/ui";
import { Box, Button, Flex, Heading, Text } from "@radix-ui/themes";
import { Link } from "@remix-run/react";
import { useEffect, useState } from "react";
export const headlines = [
	{ text: "businesses", gradient: "from-violet-400 to-violet-600" },
	{ text: "creators", gradient: "from-[#5B9EE9] to-[#2F74C0]" },
	{ text: "artists", gradient: "from-red-400 to-red-600" },
	{ text: "yourself!", gradient: "from-orange-400 to-orange-600" },
];
function Hero() {
	const [_, setCurrentIndex] = useState<number>(0);
	useEffect(() => {
		const id = setInterval(
			() => setCurrentIndex((id) => (id === headlines.length - 1 ? 0 : id + 1)),
			2500,
		);
		return () => {
			clearInterval(id);
		};
	}, []);
	return (
		<Box className="flex h-screen w-full flex-col items-center justify-center px-6 pt-10 md:pt-8 md:px-20 lg:flex-row lg:pt-16">
			<Flex direction="column" gap="4" align="center" width="100%">
				<Heading
					style={{ animationDelay: "0.20s", animationFillMode: "both" }}
					className="animate-fade-up text-balance bg-gradient-to-b from-accent-9 to-accent-11 bg-clip-text text-transparent prose font-freeman text-center text-5xl font-bold lg:text-left lg:tracking-tight"
				>
					Making Commerce
				</Heading>
				<Heading
					style={{ animationDelay: "0.20s", animationFillMode: "both" }}
					className="animate-fade-up text-balance bg-gradient-to-b from-accent-9 to-accent-11 bg-clip-text text-transparent prose font-freeman text-center text-5xl font-bold lg:text-left lg:tracking-tight"
				>
					Accessible for Everyone
				</Heading>
				<Text
					style={{ animationDelay: "0.30s", animationFillMode: "both" }}
					size="4"
					className="animate-fade-up block text-wrap max-w-xl bg-clip-text prose text-gray-11 my-6 font-medium"
				>
					We provide a e-commerce platform for entrepreneurs, creators, and
					artists. Start selling your products and services to a global audience
					today.
				</Text>
				<div className="mt-6 flex w-full flex-col justify-center items-center gap-3 sm:flex-row ">
					<Link
						className={cn("h-14 animate-fade-up")}
						to="/marketplace"
						prefetch="viewport"
						style={{ animationDelay: "0.40s", animationFillMode: "both" }}
					>
						<Button variant="classic" size="3">
							Enter marketplace
						</Button>
					</Link>
				</div>
			</Flex>
		</Box>
	);
}
export { Hero };
