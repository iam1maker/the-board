import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

/** Styled native <select>: keyboard and screen-reader behavior for free. */
export const NativeSelect = React.forwardRef<
    HTMLSelectElement,
    React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
    <div className="relative">
        <select
            ref={ref}
            className={cn(
                "h-8 cursor-pointer appearance-none rounded-md border border-input bg-card py-1 pl-2.5 pr-8 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                className,
            )}
            {...props}
        >
            {children}
        </select>
        <ChevronDown
            className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
        />
    </div>
));
NativeSelect.displayName = "NativeSelect";
