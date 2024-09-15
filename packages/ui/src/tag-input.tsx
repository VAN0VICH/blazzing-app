import * as React from "react";
import { cn } from ".";
import { Icons } from "./icons";
import { composeRefs } from "./lib/compose-refs";
import { Badge } from "@radix-ui/themes";

const inputBaseStyles = cn(
	"bg- gray-1 hover:bg- gray-2 border-border border-b- gray-7 placeholder- gray-9 text-ui-fg-base shadow-sm transition-fg relative w-full appearance-none     border outline-none",
	"focus-visible:border-accent-8 focus-visible:dark:border-accent-9 focus-visible:shadow-accent-5 focus-visible:shadow",
	"disabled:text- gray-8 disabled:!bg- gray-1 disabled:placeholder- gray-8 disabled:cursor-not-allowed disabled:!shadow-none",
	"aria-[invalid=true]:!border-ui-border-error aria-[invalid=true]:focus:!border-red-9 aria-[invalid=true]:focus:!border-2 aria-[invalid=true]:focus:!shadow-none invalid:!border-red-10",
);
type TagInputProps = {
	value: string[];
	onChange: React.Dispatch<React.SetStateAction<string[]>>;
	className?: string;
	autoFocus?: boolean;
	placeholder?: string;
	color?: string;
};

const TagInput = React.forwardRef<HTMLInputElement, TagInputProps>(
	(
		{
			className,
			value,
			onChange,
			placeholder = "Type...",
			autoFocus = false,
			color = "ruby",
			...props
		},
		ref,
	) => {
		const [pendingDataPoint, setPendingDataPoint] = React.useState("");
		const [isFocused, setIsFocused] = React.useState(autoFocus || false);

		React.useEffect(() => {
			if (pendingDataPoint.includes(",")) {
				const newDataPoints = new Set([
					...value,
					...pendingDataPoint.split(",").map((chunk) => chunk.trim()),
				]);
				onChange(Array.from(newDataPoints));
				setPendingDataPoint("");
			}
		}, [pendingDataPoint, onChange, value]);
		const inputRef = React.useRef<HTMLInputElement>(null);

		const addPendingDataPoint = () => {
			if (pendingDataPoint) {
				const newDataPoints = new Set([...value, pendingDataPoint]);
				onChange(Array.from(newDataPoints));
				setPendingDataPoint("");
			}
		};
		React.useEffect(() => {
			const handleFocus = () => setIsFocused(true);
			const handleBlur = () => setIsFocused(false);

			const node = inputRef.current;
			if (node) {
				node.addEventListener("focus", handleFocus);
				node.addEventListener("blur", handleBlur);

				// Autofocus logic
				if (autoFocus) {
					node.focus();
				}
			}

			return () => {
				if (node) {
					node.removeEventListener("focus", handleFocus);
					node.removeEventListener("blur", handleBlur);
				}
			};
		}, [autoFocus]);

		return (
			<div
				className={cn(
					inputBaseStyles,
					"h-10 px-2 gap-1 flex items-center overflow-x-auto hide-scrollbar ",
					// caveat: :has() variant requires tailwind v3.4 or above: https://tailwindcss.com/blog/tailwindcss-v3-4#new-has-variant
					className,
					{ "border-accent-9": isFocused },
				)}
			>
				{value.map((item) => (
					<Badge
						key={item}
						//@ts-ignore
						color={color}
					>
						{item}
						<button
							type="button"
							className="w-6 h-8 flex justify-center items-center focus-visible:outline-none focus-visible:ring-1"
							onClick={() => {
								onChange(value.filter((i) => i !== item));
							}}
							tabIndex={-1}
						>
							<Icons.Close size={13} />
						</button>
					</Badge>
				))}
				<input
					className="flex-1 outline-none text-sm bg-transparent h-10"
					value={pendingDataPoint}
					onChange={(e) => setPendingDataPoint(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === ",") {
							e.preventDefault();
							addPendingDataPoint();
						} else if (
							e.key === "Backspace" &&
							pendingDataPoint.length === 0 &&
							value.length > 0
						) {
							e.preventDefault();
							onChange(value.slice(0, -1));
						}
					}}
					{...props}
					ref={composeRefs(ref, inputRef)}
				/>
			</div>
		);
	},
);

TagInput.displayName = "TagInput";

export { TagInput };
