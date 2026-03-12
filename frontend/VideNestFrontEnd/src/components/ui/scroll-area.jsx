// ============================================================
// Copyright (c) 2026 Prajjwal (github.com/Prajjwal2051)
// Project : VidNest — Video Sharing Platform
// License : Proprietary — All Rights Reserved
// Unauthorized copying, modification, or distribution of this
// file, via any medium, is strictly prohibited.
// ============================================================
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
