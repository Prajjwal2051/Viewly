// Pure React AlertDialog implementation (no external Radix dependency)
// This matches the shadcn/ui API surface for future compatibility
import * as React from "react"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

const AlertDialogContext = React.createContext({})

const AlertDialog = ({ open, onOpenChange, children }) => {
    const [isOpen, setIsOpen] = React.useState(open ?? false)
    const controlled = open !== undefined

    const openState = controlled ? open : isOpen
    const setOpenState = controlled ? onOpenChange : setIsOpen

    React.useEffect(() => {
        if (!openState) return
        const handler = (e) => {
            if (e.key === "Escape") setOpenState(false)
        }
        document.addEventListener("keydown", handler)
        return () => document.removeEventListener("keydown", handler)
    }, [openState, setOpenState])

    return (
        <AlertDialogContext.Provider
            value={{ open: openState, onOpenChange: setOpenState }}
        >
            {children}
        </AlertDialogContext.Provider>
    )
}

const AlertDialogTrigger = React.forwardRef(
    ({ onClick, children, asChild, ...props }, ref) => {
        const { onOpenChange } = React.useContext(AlertDialogContext)
        if (asChild && React.isValidElement(children)) {
            return React.cloneElement(children, {
                ref,
                onClick: (e) => {
                    children.props.onClick?.(e)
                    onClick?.(e)
                    onOpenChange(true)
                },
            })
        }
        return (
            <button
                ref={ref}
                onClick={(e) => {
                    onClick?.(e)
                    onOpenChange(true)
                }}
                {...props}
            >
                {children}
            </button>
        )
    }
)
AlertDialogTrigger.displayName = "AlertDialogTrigger"

const AlertDialogPortal = ({ children }) => children

const AlertDialogOverlay = React.forwardRef(({ className, ...props }, ref) => {
    const { onOpenChange } = React.useContext(AlertDialogContext)
    return (
        <div
            ref={ref}
            className={cn(
                "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm",
                className
            )}
            {...props}
        />
    )
})
AlertDialogOverlay.displayName = "AlertDialogOverlay"

const AlertDialogContent = React.forwardRef(
    ({ className, children, ...props }, ref) => {
        const { open } = React.useContext(AlertDialogContext)
        if (!open) return null
        return (
            <>
                <AlertDialogOverlay />
                <div
                    ref={ref}
                    role="alertdialog"
                    aria-modal="true"
                    className={cn(
                        "fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border bg-background p-6 shadow-lg sm:rounded-lg animate-in fade-in-0 zoom-in-95 slide-in-from-left-1/2 slide-in-from-top-[48%]",
                        className
                    )}
                    {...props}
                >
                    {children}
                </div>
            </>
        )
    }
)
AlertDialogContent.displayName = "AlertDialogContent"

const AlertDialogHeader = ({ className, ...props }) => (
    <div
        className={cn(
            "flex flex-col space-y-2 text-center sm:text-left",
            className
        )}
        {...props}
    />
)
AlertDialogHeader.displayName = "AlertDialogHeader"

const AlertDialogFooter = ({ className, ...props }) => (
    <div
        className={cn(
            "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
            className
        )}
        {...props}
    />
)
AlertDialogFooter.displayName = "AlertDialogFooter"

const AlertDialogTitle = React.forwardRef(({ className, ...props }, ref) => (
    <h2
        ref={ref}
        className={cn("text-lg font-semibold", className)}
        {...props}
    />
))
AlertDialogTitle.displayName = "AlertDialogTitle"

const AlertDialogDescription = React.forwardRef(
    ({ className, ...props }, ref) => (
        <p
            ref={ref}
            className={cn("text-sm text-muted-foreground", className)}
            {...props}
        />
    )
)
AlertDialogDescription.displayName = "AlertDialogDescription"

const AlertDialogAction = React.forwardRef(
    ({ className, onClick, children, ...props }, ref) => {
        const { onOpenChange } = React.useContext(AlertDialogContext)
        return (
            <button
                ref={ref}
                className={cn(buttonVariants(), className)}
                onClick={(e) => {
                    onClick?.(e)
                    onOpenChange(false)
                }}
                {...props}
            >
                {children}
            </button>
        )
    }
)
AlertDialogAction.displayName = "AlertDialogAction"

const AlertDialogCancel = React.forwardRef(
    ({ className, onClick, children, ...props }, ref) => {
        const { onOpenChange } = React.useContext(AlertDialogContext)
        return (
            <button
                ref={ref}
                className={cn(
                    buttonVariants({ variant: "outline" }),
                    "mt-2 sm:mt-0",
                    className
                )}
                onClick={(e) => {
                    onClick?.(e)
                    onOpenChange(false)
                }}
                {...props}
            >
                {children}
            </button>
        )
    }
)
AlertDialogCancel.displayName = "AlertDialogCancel"

export {
    AlertDialog,
    AlertDialogPortal,
    AlertDialogOverlay,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogAction,
    AlertDialogCancel,
}
