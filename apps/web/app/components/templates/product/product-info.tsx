import { cn } from "@blazzing-app/ui";
import { truncateString } from "@blazzing-app/utils";
import type { Product, Variant } from "@blazzing-app/validators/client";
import { Avatar, Button, Flex, Grid, Heading, Text } from "@radix-ui/themes";
import { Link } from "@remix-run/react";
import { useState } from "react";
import Price from "~/components/price";

interface GeneralInfoProps {
	product: Product | undefined;
	baseVariant: Variant | undefined | null;
	setView?: (value: "preview" | "input") => void;
	isDashboard?: boolean;
}

function GeneralInfo({
	baseVariant,
	setView,
	product,
	isDashboard,
}: GeneralInfoProps) {
	const [isTruncated, setIsTruncated] = useState(true);

	const handleToggle = () => {
		setIsTruncated(!isTruncated);
	};

	const displayText = isTruncated
		? truncateString(baseVariant?.description ?? "", 200)
		: baseVariant?.description ?? "";
	return (
		<Grid>
			<Link
				to={isDashboard ? "/store" : `/stores/${product?.store.name}`}
				className="flex flex-col "
			>
				<Flex gap="2" width="100%">
					<Avatar fallback="4" />

					<Flex justify="between" gap="2">
						<Text className="font-medium text-lg">{product?.store.name}</Text>
						{setView && (
							<Button
								variant="outline"
								type="button"
								size="2"
								className="sticky top-4 right-4 z-10"
								onClick={async () => {
									setView("input");
								}}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										e.preventDefault();
										e.stopPropagation();
										setView("input");
									}
								}}
							>
								Edit
							</Button>
						)}
					</Flex>
				</Flex>
			</Link>
			<Flex direction="column" gap="3" py="2">
				<Heading className="font-medium" size="3">{`${
					baseVariant?.title ?? "Untitled"
				}`}</Heading>
				<Heading>
					{displayText}
					<Text
						onClick={handleToggle}
						onKeyDown={handleToggle}
						className={cn(
							"pl-1 underline cursor-pointer bg-transparent transition",
							displayText.length < 200 && "hidden",
						)}
					>
						{isTruncated ? "Reveal" : "Hide"}
					</Text>
				</Heading>
			</Flex>

			<Price
				className="text-xl py-4 font-black"
				amount={baseVariant?.prices?.[0]?.amount ?? 0}
				currencyCode={baseVariant?.prices?.[0]?.currencyCode ?? "USD"}
			/>
		</Grid>
	);
}

export { GeneralInfo };
