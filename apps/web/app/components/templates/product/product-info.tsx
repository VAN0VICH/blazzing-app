import { cn } from "@blazzing-app/ui";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@blazzing-app/ui/accordion";
import { truncateString } from "@blazzing-app/utils";
import type { Variant } from "../../../../../../packages/validators/src/store-entities";
import { Avatar, Flex, Grid, Heading, Text } from "@radix-ui/themes";
import { Link } from "@remix-run/react";
import { useState } from "react";
import ImagePlaceholder from "~/components/image-placeholder";

interface GeneralInfoProps {
	variant: Variant | undefined | null;
	isDashboard?: boolean;
}

function GeneralInfo({ variant, isDashboard }: GeneralInfoProps) {
	const [isTruncated, setIsTruncated] = useState(true);

	const handleToggle = () => {
		setIsTruncated(!isTruncated);
	};

	const displayText = isTruncated
		? truncateString(variant?.description ?? "", 200)
		: (variant?.description ?? "");

	return (
		<Grid>
			<Link
				to={isDashboard ? "/store" : `/stores/${variant?.product?.store?.name}`}
				className="flex flex-col w-fit"
			>
				<Flex gap="2">
					<Avatar
						src={variant?.product?.store?.image?.url}
						fallback={<ImagePlaceholder />}
					/>

					<Flex justify="between" gap="2">
						<Text className="font-medium text-lg">
							{variant?.product?.store?.name}
						</Text>
					</Flex>
				</Flex>
			</Link>
			<Flex direction="column" gap="3" py="3">
				<Heading className="font-bold" size="7">{`${
					variant?.title ?? "Untitled"
				}`}</Heading>
				<Text size="3">
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
					<AccordionTrigger>
						<Text>Product information</Text>
					</AccordionTrigger>
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
				currencyCode={baseVariant?.prices?.[0]?.currencyCode ?? "BYN"}
			/> */}
		</Grid>
	);
}

export { GeneralInfo };
