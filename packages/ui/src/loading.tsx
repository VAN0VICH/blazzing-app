import { cn } from ".";
import { Icons } from "./icons";

export const LoadingSpinner = ({ className }: { className?: string }) => {
	return (
		<Icons.Loader
			className={cn("animate-spin text-accent-11", className)}
			aria-hidden="true"
		/>
	);
};
