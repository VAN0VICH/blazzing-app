import { cn } from "@blazzing-app/ui";
import { truncateString } from "@blazzing-app/utils";
import type { Product, Variant } from "@blazzing-app/validators/client";
import { Avatar, Button, Flex, Grid, Heading, Text } from "@radix-ui/themes";
import { Link } from "@remix-run/react";
import { useState } from "react";
import ImagePlaceholder from "~/components/image-placeholder";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@blazzing-app/ui/accordion";

interface GeneralInfoProps {
	product: Product | undefined;
	baseVariant: Variant | undefined | null;
	isDashboard?: boolean;
}

function GeneralInfo({ baseVariant, product, isDashboard }: GeneralInfoProps) {
	const [isTruncated, setIsTruncated] = useState(true);

	const handleToggle = () => {
		setIsTruncated(!isTruncated);
	};

	const displayText = isTruncated
		? truncateString(baseVariant?.description ?? "", 200)
		: (baseVariant?.description ?? "");
	return (
		<Grid>
			<Link
				to={isDashboard ? "/store" : `/stores/${product?.store.name}`}
				className="flex flex-col "
			>
				<Flex gap="2" width="100%">
					<Avatar
						src={product?.store.image?.url}
						fallback={<ImagePlaceholder />}
					/>

					<Flex justify="between" gap="2">
						<Text className="font-medium text-lg">{product?.store.name}</Text>
					</Flex>
				</Flex>
			</Link>
			<Flex direction="column" gap="3" py="3">
				<Heading className="font-bold" size="7">{`${
					baseVariant?.title ?? "Untitled"
				}`}</Heading>
				<Text size="2">
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
				</Text>
			</Flex>

			<Accordion type="multiple" className="w-full border-t border-border">
				<AccordionItem value="item-1">
					<AccordionTrigger>Product information</AccordionTrigger>
					<AccordionContent>
						Yes. It adheres to the WAI-ARIA design pattern.
					</AccordionContent>
				</AccordionItem>
				<AccordionItem value="item-2">
					<AccordionTrigger>Shippings & returns</AccordionTrigger>
					<AccordionContent>
						Yes. It comes with default styles that matches the other
						components&apos; aesthetic.
					</AccordionContent>
				</AccordionItem>
			</Accordion>

			{/* <Price
				className="text-xl py-4 font-black"
				amount={baseVariant?.prices?.[0]?.amount ?? 0}
				currencyCode={baseVariant?.prices?.[0]?.currencyCode ?? "USD"}
			/> */}
		</Grid>
	);
}

export { GeneralInfo };
