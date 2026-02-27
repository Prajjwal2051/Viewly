// Pure React ScrollArea implementation (no external Radix dependency)
// This matches the shadcn/ui API surface for future compatibility
import * as React from "react"
import { cn } from "@/lib/utils"

const ScrollArea = React.forwardRef(
    ({ className, children, ...props }, ref) => (
        <div
            ref={ref}
            className={cn("relative overflow-auto", className)}
            style={{
                scrollbarWidth: "thin",
                scrollbarColor: "hsl(var(--border)) transparent",
            }}
            {...props}
        >
            {children}
        </div>
    )
)
ScrollArea.displayName = "ScrollArea"

const ScrollBar = React.forwardRef(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex touch-none select-none", className)}
        {...props}
    />
))
ScrollBar.displayName = "ScrollBar"

export { ScrollArea, ScrollBar }
