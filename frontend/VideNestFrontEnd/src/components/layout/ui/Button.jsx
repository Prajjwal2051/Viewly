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
        default: "bg-red-600 text-white hover:bg-red-700 font-bold", // Primary actions - Pinterest Red
        ghost: "hover:bg-[#2A2D2E] text-gray-300 hover:text-white", // Subtle actions - Dark Mode
        outline:
            "border border-gray-700 text-gray-300 hover:bg-[#2A2D2E] hover:text-white", // Secondary actions
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
