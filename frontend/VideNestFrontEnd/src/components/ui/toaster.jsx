// Theming wrapper for react-hot-toast to match shadcn/ui design system
// This keeps all existing toast() calls working while applying shadcn visual style
import { Toaster as HotToaster } from "react-hot-toast"

const Toaster = () => (
    <HotToaster
        position="top-right"
        toastOptions={{
            // Base styles applied to all toast types
            style: {
                background: "hsl(var(--card))",
                color: "hsl(var(--card-foreground))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.75rem",
                boxShadow:
                    "0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.2)",
                padding: "12px 16px",
                fontSize: "0.875rem",
                fontFamily: "inherit",
                maxWidth: "360px",
            },
            // Per-type overrides
            success: {
                iconTheme: {
                    primary: "#22c55e", // green-500
                    secondary: "hsl(var(--card))",
                },
            },
            error: {
                iconTheme: {
                    primary: "#ef4444", // red-500
                    secondary: "hsl(var(--card))",
                },
            },
            loading: {
                iconTheme: {
                    primary: "hsl(var(--primary))",
                    secondary: "hsl(var(--card))",
                },
            },
            duration: 3500,
        }}
    />
)

export { Toaster }
export default Toaster
