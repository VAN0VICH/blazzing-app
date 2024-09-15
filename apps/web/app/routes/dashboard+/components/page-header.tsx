import { cn } from "@blazzing-app/ui";
import { Heading, Section } from "@radix-ui/themes";

const PageHeader = ({
	title,
	className,
}: { title: string; className?: string }) => {
	return (
		<Heading size="5" className={cn("   text-accent-11", className)}>
			{title}
		</Heading>
	);
};
export { PageHeader };
