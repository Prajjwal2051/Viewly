// ============================================
// BUTTON COMPONENT - REUSABLE UI ELEMENT
// ============================================
// Flexible button with multiple variants and sizes.
// Prevents repetitive Tailwind classes across the app.

/**
 * Props explained:
 * - children: Button text/icon (e.g., "Submit" or <Icon />)
 * - variant: Visual style ("default", "ghost", "outline")
 * - size: Padding size ("default", "icon", "sm")
 * - className: Additional custom styles to merge
 * - ...props: Spreads remaining props (onClick, disabled, type, etc.)
 */
const Button = ({
    children,
    variant = "default",
    size = "default",
    className = "",
    ...props
}) => {
    // Base styles applied to ALL buttons (rounded corners, transitions, etc.)
    const baseStyles =
        "rounded-lg font-medium transition-colors focus:outline-none disabled:opacity-50"

    // Variant styles - different looks for different contexts
    const variants = {
        default: "bg-blue-600 text-white hover:bg-blue-700", // Primary actions
        ghost: "hover:bg-gray-100 text-gray-700", // Subtle actions
        outline: "border border-gray-300 hover:bg-gray-50", // Secondary actions
    }

    // Size styles - controls padding and text size
    const sizes = {
        default: "px-4 py-2", // Normal buttons
        icon: "p-2", // Icon-only buttons (square)
        sm: "px-3 py-1.5 text-sm", // Compact buttons
    }

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props} // Passes through onClick, disabled, type="submit", etc.
        >
            {children}
        </button>
    )
}

export default Button
