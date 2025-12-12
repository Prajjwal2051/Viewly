import { forwardRef } from "react"

// ============================================
// INPUT COMPONENT - REUSABLE FORM FIELD
// ============================================
// Styled text input with consistent design across all forms.

/**
 * Props explained:
 * - className: Additional custom styles to merge with defaults
 * - ...props: Spreads all HTML input props (type, placeholder, value, onChange, etc.)
 *
 * Usage example:
 * <Input type="email" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} />
 */
const Input = forwardRef(({ className = "", ...props }, ref) => {
    return (
        <input
            ref={ref}
            // Default styles with dark mode support
            className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-red-500 bg-[#1E2021] dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 ${className}`}
            {...props} // Passes through type, placeholder, value, onChange, name, required, etc.
        />
    )
})

Input.displayName = "Input"

export default Input
