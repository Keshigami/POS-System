import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] select-none",
    {
        variants: {
            variant: {
                default: "bg-primary text-primary-foreground border-2 border-primary hover:bg-primary/90 active:border-primary/70",
                destructive:
                    "bg-destructive text-destructive-foreground border-2 border-destructive hover:bg-destructive/90 active:border-destructive/70",
                outline:
                    "border-2 border-gray-300 dark:border-gray-600 bg-background hover:bg-accent hover:text-accent-foreground active:border-gray-400 dark:active:border-gray-500",
                secondary:
                    "bg-secondary text-secondary-foreground border-2 border-secondary hover:bg-secondary/80",
                ghost: "border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:bg-accent hover:text-accent-foreground",
                link: "text-primary underline-offset-4 hover:underline",
            },
            size: {
                default: "h-12 min-h-[48px] px-4 py-2",
                sm: "h-10 min-h-[40px] rounded-lg px-3",
                lg: "h-14 min-h-[56px] rounded-lg px-8 text-base",
                icon: "h-12 w-12 min-h-[48px] min-w-[48px]",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button";
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button, buttonVariants };
