import { forwardRef } from "react"

// ============================================
// INPUT COMPONENT - REUSABLE FORM FIELD
// ============================================
// Styled text input with consistent dark-mode design across all forms.
// Provides accessibility support via ref forwarding for form libraries.

/**
 * INPUT COMPONENT
 * 
 * Purpose:
 * - Provide consistent input styling across all forms
 * - Support dark mode theming
 * - Enable accessibility with ref forwarding
 * - Work with form libraries (react-hook-form, formik)
 * 
 * Why use a custom Input instead of plain <input>?
 * - Consistent design: All inputs look the same
 * - Dark mode support: Automatic color switching
 * - Reduced code: Don't repeat Tailwind classes everywhere
 * - Focus states: Built-in red ring on focus
 * - Accessibility: Proper contrast ratios for readability
 * 
 * Ref Forwarding Explained:
 * - forwardRef allows parent components to access the input element
 * - Needed for react-hook-form's register() function
 * - Enables programmatic focus control (e.g., focus on error)
 * 
 * Usage Examples:
 * 
 * Basic:
 * <Input type="email" placeholder="Enter email" />
 * 
 * With react-hook-form:
 * <Input {...register("email")} />
 * 
 * With custom styling:
 * <Input className="text-lg" placeholder="Search..." />
 * 
 * @param {string} className - Additional Tailwind classes to merge
 * @param {Object} props - All standard HTML input props (type, placeholder, etc.)
 * @param {React.Ref} ref - Forwarded ref for form library integration
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
