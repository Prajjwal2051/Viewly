// ============================================
// TOAST COMPONENT - NOTIFICATION MESSAGES
// ============================================
// Displays temporary notification messages that auto-dismiss after duration.
// Used for success confirmations, error alerts, and info messages.

import React, { useEffect } from "react"
import { X, CheckCircle, AlertCircle, Info } from "lucide-react"

/**
 * TOAST COMPONENT
 * 
 * Purpose:
 * - Show temporary notification messages
 * - Auto-dismiss after specified duration
 * - Provide visual feedback for user actions
 * - Non-blocking (doesn't stop user workflow)
 * 
 * Toast Types:
 * 
 * 1. Success (Green)
 *    - Confirms successful actions
 *    - Examples: "Video uploaded!", "Comment posted!"
 * 
 * 2. Error (Red)
 *    - Alerts user to problems
 *    - Examples: "Upload failed", "Invalid credentials"
 * 
 * 3. Info (Blue)
 *    - General information messages
 *    - Examples: "Copying link...", "Saving draft..."
 * 
 * How It Works:
 * 1. Component mounts
 * 2. useEffect sets timer for duration (default 3 seconds)
 * 3. Toast appears with slide-in animation
 * 4. After duration, onClose() is called
 * 5. Parent removes toast from DOM
 * 
 * Position:
 * - Fixed to top-right corner
 * - Stacks vertically if multiple toasts
 * - z-50 keeps above other content
 * 
 * Accessibility:
 * - Icon indicates message type visually
 * - Color coding (green/red/blue) for quick recognition
 * - Close button for manual dismissal
 * 
 * Note: Most apps use react-hot-toast library instead
 * This component exists as a custom alternative
 * 
 * @param {string} message - Toast message text
 * @param {string} type - Toast type (success|error|info)
 * @param {Function} onClose - Callback when toast dismisses
 * @param {number} duration - Auto-dismiss time in ms (default 3000)
 */

const Toast = ({ message, type = "success", onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose()
        }, duration)

        return () => clearTimeout(timer)
    }, [duration, onClose])

    const icons = {
        success: <CheckCircle className="w-5 h-5" />,
        error: <AlertCircle className="w-5 h-5" />,
        info: <Info className="w-5 h-5" />,
    }

    const colors = {
        success: "bg-green-600",
        error: "bg-red-600",
        info: "bg-blue-600",
    }

    return (
        <div
            className={`fixed top-4 right-4 z-50 ${colors[type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] animate-in slide-in-from-top-2 duration-300`}
        >
            {icons[type]}
            <span className="flex-1 font-medium">{message}</span>
            <button
                onClick={onClose}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    )
}

export default Toast
