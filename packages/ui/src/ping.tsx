import { cn } from ".";

export const Ping = ({ className }: { className?: string }) => {
	return (
		<span className={cn("relative justify-center items-center flex h-3 w-3")}>
			<span
				className={cn(
					"animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-9 opacity-75",
					className,
				)}
			/>
			<span
				className={cn(
					"relative inline-flex rounded-full h-2 w-2 bg-accent-9",
					className,
				)}
			/>
		</span>
	);
};
