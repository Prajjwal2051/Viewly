// ============================================
// BUTTON COMPONENT - REUSABLE INTERACTIVE ELEMENT
// ============================================
// Flexible button with multiple visual variants and sizes.
// Eliminates repetitive Tailwind classes and ensures design consistency.

/**
 * BUTTON COMPONENT
 * 
 * Purpose:
 * - Provide consistent button styling across entire app
 * - Support multiple visual styles (variants)
 * - Handle different size requirements
 * - Include proper disabled states
 * 
 * Why use a custom Button?
 * - Design consistency: All buttons follow same patterns
 * - Easy updates: Change button style once, affects all instances
 * - Accessibility: Built-in disabled states and focus handling
 * - Less code: Avoid repeating long Tailwind classes
 * 
 * Variants Explained:
 * 
 * 1. default (Primary Action)
 *    - Red background (#ef4444)
 *    - White text
 *    - Example: "Submit", "Save", "Login"
 * 
 * 2. ghost (Subtle Action)
 *    - Transparent background
 *    - Gray text, hover shows background
 *    - Example: "Cancel", icon buttons
 * 
 * 3. outline (Secondary Action)
 *    - Border with no fill
 *    - Gray border and text
 *    - Example: "Reset", "Clear"
 * 
 * Sizes Explained:
 * - default: Normal buttons (px-4 py-2)
 * - icon: Square buttons for icons only (p-2)
 * - sm: Compact buttons for tight spaces (px-3 py-1.5)
 * 
 * Usage Examples:
 * 
 * Primary button:
 * <Button onClick={handleSubmit}>Submit</Button>
 * 
 * Icon button:
 * <Button variant="ghost" size="icon"><X /></Button>
 * 
 * Disabled button:
 * <Button disabled={isLoading}>Loading...</Button>
 * 
 * @param {ReactNode} children - Button content (text or icon)
 * @param {string} variant - Visual style (default|ghost|outline)
 * @param {string} size - Button size (default|icon|sm)
 * @param {string} className - Additional Tailwind classes
 * @param {Object} props - All standard HTML button props (onClick, disabled, etc.)
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
