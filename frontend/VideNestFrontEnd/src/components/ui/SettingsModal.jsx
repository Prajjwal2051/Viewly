// ============================================
// SETTINGS MODAL - THEME PREFERENCES
// ============================================
// Modal popup for user to toggle between light and dark mode.
// Currently displays both options but light mode is disabled.

import { X, Moon, Sun } from "lucide-react"
import { useTheme } from "../../context/ThemeContext"

/**
 * Props:
 * - isOpen: Boolean to show/hide modal
 * - onClose: Function to close modal (typically from parent component)
 */
const SettingsModal = ({ isOpen, onClose }) => {
    const { isDarkMode, toggleTheme } = useTheme()

    // Don't render anything if modal is closed
    if (!isOpen) return null

    return (
        <>
            {/* BACKDROP - Semi-transparent overlay, clicking closes modal */}
            <div
                className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* MODAL CONTAINER - Centered on screen using transform */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md">
                {/* Modal Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {/* MODAL HEADER - Title and Close Button */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-2xl font-bold dark:text-white">
                            Settings
                        </h2>
                        {/* Close Button - Calls onClose to hide modal */}
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 dark:text-gray-300" />
                        </button>
                    </div>

                    {/* MODAL CONTENT - Theme Selection */}
                    <div className="p-6">
                        {/* Section Label */}
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                            Appearance
                        </h3>

                        {/* Theme Options Container */}
                        <div className="space-y-3">
                            {/* LIGHT MODE OPTION - Currently disabled */}
                            <button
                                onClick={() => {
                                    // Only toggle if currently in dark mode
                                    if (isDarkMode) toggleTheme()
                                }}
                                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                                    !isDarkMode
                                        ? "border-purple-600 bg-purple-50 dark:bg-purple-900/20" // Active state
                                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600" // Inactive state
                                }`}
                            >
                                {/* Sun Icon - Changes color based on selection */}
                                <div
                                    className={`p-3 rounded-lg ${!isDarkMode ? "bg-orange-100 text-orange-600" : "bg-gray-100 dark:bg-gray-700 text-gray-400"}`}
                                >
                                    <Sun className="w-6 h-6" />
                                </div>
                                {/* Text Content */}
                                <div className="flex-1 text-left">
                                    <div className="font-semibold dark:text-white">
                                        Light Mode
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        Bright and clear
                                    </div>
                                </div>
                                {/* Selected Indicator - Only shown when active */}
                                {!isDarkMode && (
                                    <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-white"></div>
                                    </div>
                                )}
                            </button>

                            {/* DARK MODE OPTION - Currently active/forced */}
                            <button
                                onClick={() => {
                                    // Only toggle if currently in light mode
                                    if (!isDarkMode) toggleTheme()
                                }}
                                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                                    isDarkMode
                                        ? "border-purple-600 bg-purple-50 dark:bg-purple-900/20" // Active state
                                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600" // Inactive state
                                }`}
                            >
                                {/* Moon Icon - Changes color based on selection */}
                                <div
                                    className={`p-3 rounded-lg ${isDarkMode ? "bg-purple-900/30 text-purple-400" : "bg-gray-100 dark:bg-gray-700 text-gray-400"}`}
                                >
                                    <Moon className="w-6 h-6" />
                                </div>
                                {/* Text Content */}
                                <div className="flex-1 text-left">
                                    <div className="font-semibold dark:text-white">
                                        Dark Mode
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        Easy on the eyes
                                    </div>
                                </div>
                                {/* Selected Indicator - Only shown when active */}
                                {isDarkMode && (
                                    <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-white"></div>
                                    </div>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default SettingsModal
