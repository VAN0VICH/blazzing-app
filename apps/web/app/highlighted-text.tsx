import { cn } from "@blazzing-app/ui";
import { Text } from "@radix-ui/themes";
import type React from "react";

interface HighlightedTextProps {
	text: string;
	searchTerm: string;
	className?: string;
}

const HighlightedText: React.FC<HighlightedTextProps> = ({
	text,
	searchTerm,
	className,
}) => {
	if (!searchTerm) {
		return <Text className={cn(className)}>{text}</Text>;
	}

	const regex = new RegExp(`(${searchTerm})`, "gi");
	const parts = text.split(regex);

	return (
		<Text className={cn(className)}>
			{parts.map((part, index) =>
				regex.test(part) ? (
					<Text key={index} className="bg-accent-3 text-accent-11">
						{part}
					</Text>
				) : (
					<Text key={index}>{part}</Text>
				),
			)}
		</Text>
	);
};

export { HighlightedText };
