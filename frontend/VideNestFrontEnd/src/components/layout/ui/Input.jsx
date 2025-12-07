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
const Input = ({ className = "", ...props }) => {
    return (
        <input
            // Default styles: full width, padding, border, rounded, focus ring
            className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${className}`}
            {...props} // Passes through type, placeholder, value, onChange, name, required, etc.
        />
    )
}

export default Input
