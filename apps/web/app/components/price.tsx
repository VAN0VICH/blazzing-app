import React, { useMemo } from "react";
import { cn } from "@blazzing-app/ui";

const Price = ({
	amount,
	className,
	currencyCode = "AUD",
	currencyCodeClassName,
}: {
	amount: number;
	className?: string;
	currencyCode: string;
	currencyCodeClassName?: string;
} & React.ComponentProps<"p">) => {
	const formatter = useMemo(
		() =>
			new Intl.NumberFormat(undefined, {
				style: "currency",
				currency: currencyCode,
				currencyDisplay: "narrowSymbol",
			}),
		[currencyCode],
	);

	const formattedAmount = useMemo(
		() => formatter.format(amount / 100),
		[formatter, amount],
	);

	return (
		<p suppressHydrationWarning={true} className={className}>
			{formattedAmount}
			<span className={cn("ml-1 inline", currencyCodeClassName)}>
				{currencyCode}
			</span>
		</p>
	);
};

export default React.memo(Price);
