import { Drawer } from "vaul";
import { cn } from ".";
//@ts-ignore
const { Root, Trigger } = Drawer;
function DialogContent({
	children,
	className,
	overlay = true,
}: { children: React.ReactNode; className?: string; overlay?: boolean }) {
	return (
		<Drawer.Portal>
			{overlay && <Drawer.Overlay className="fixed inset-0 z-50 bg-black/50" />}
			<Drawer.Content
				className={cn(
					"border-border fixed bottom-0 top-0 z-50 flex w-5/6 flex-col rounded-lg border bg-white dark:bg-component backdrop-blur-md after:hidden focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-accent-7 right-0",
					className,
				)}
			>
				{children}
			</Drawer.Content>
		</Drawer.Portal>
	);
}

function DialogTitle(props: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<Drawer.Title
			className={cn(
				"space-y-2 text-center text-lg font-semibold text-foreground sm:text-left",
			)}
			{...props}
		/>
	);
}

export {
	DialogContent,
	Root as DialogRoot,
	DialogTitle,
	Trigger as DialogTrigger,
};
