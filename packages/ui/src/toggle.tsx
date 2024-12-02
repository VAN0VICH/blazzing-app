import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./";

const toggleVariants = cva(
	"inline-flex items-center overflow-hidden border border-border bg-component justify-center text-gray-11 rounded-md font-medium ring-offset-background transition-colors hover:bg-gray-2 hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-accent-9   disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent-2 data-[state=on]:border-accent-9 data-[state=on]:dark:border-accent-9 data-[state=on]:text-accent-11",
	{
		variants: {
			variant: {
				default: "bg-component",
				outline:
					"border border-gray-6 bg-component hover:border-accent-9 hover:bg-accent-2 hover:text-accent-11",
			},
			size: {
				default: "h-10 px-3",
				sm: "h-9 px-2.5",
				lg: "h-11 px-5",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

const Toggle = React.forwardRef<
	React.ElementRef<typeof TogglePrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> &
		VariantProps<typeof toggleVariants>
>(({ className, variant, size, ...props }, ref) => (
	<TogglePrimitive.Root
		ref={ref}
		className={cn(toggleVariants({ variant, size, className }))}
		{...props}
	/>
));

Toggle.displayName = TogglePrimitive.Root.displayName;

export { Toggle, toggleVariants };
