import { X, Moon, Sun } from "lucide-react"
import { useTheme } from "../../context/ThemeContext"

const SettingsModal = ({ isOpen, onClose }) => {
    const { isDarkMode, toggleTheme } = useTheme()

    if (!isOpen) return null

    return (
        <>
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-2xl font-bold dark:text-white">Settings</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 dark:text-gray-300" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                            Appearance
                        </h3>

                        {/* Theme Options */}
                        <div className="space-y-3">
                            {/* Light Mode */}
                            <button
                                onClick={() => {
                                    if (isDarkMode) toggleTheme()
                                }}
                                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                                    !isDarkMode
                                        ? "border-purple-600 bg-purple-50 dark:bg-purple-900/20"
                                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                                }`}
                            >
                                <div className={`p-3 rounded-lg ${!isDarkMode ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}>
                                    <Sun className="w-6 h-6" />
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="font-semibold dark:text-white">Light Mode</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Bright and clear</div>
                                </div>
                                {!isDarkMode && (
                                    <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-white"></div>
                                    </div>
                                )}
                            </button>

                            {/* Dark Mode */}
                            <button
                                onClick={() => {
                                    if (!isDarkMode) toggleTheme()
                                }}
                                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                                    isDarkMode
                                        ? "border-purple-600 bg-purple-50 dark:bg-purple-900/20"
                                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                                }`}
                            >
                                <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}>
                                    <Moon className="w-6 h-6" />
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="font-semibold dark:text-white">Dark Mode</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Easy on the eyes</div>
                                </div>
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
