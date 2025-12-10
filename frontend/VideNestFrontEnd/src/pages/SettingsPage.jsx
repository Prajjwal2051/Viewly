// ============================================
// SETTINGS PAGE - USER PREFERENCES
// ============================================
// Allows users to customize app appearance and manage account settings.
// Currently implements dark mode toggle with placeholders for future features.

import { useTheme } from "../context/ThemeContext"
import { Moon, Sun, User, Bell, Shield, Smartphone } from "lucide-react"

/**
 * SETTINGS PAGE COMPONENT
 * Provides interface for customizing user preferences
 * 
 * Current Features:
 * - Dark mode toggle with smooth transition
 * - Visual toggle switch with icon indicators
 * 
 * Future Features (Placeholders):
 * - Notification preferences
 * - Privacy and security settings
 * - Account management options
 */
const SettingsPage = () => {
    // Access theme state and toggle function from context
    const { isDarkMode, toggleTheme } = useTheme()

    return (
        // Container with max width for better readability
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 dark:text-white">Settings</h1>

            {/* APPEARANCE SECTION - Theme Toggle */}
            <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-6">
                <div className="p-6">
                    {/* Section Header */}
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 dark:text-white">
                        <Smartphone className="w-5 h-5 text-purple-600" />
                        Appearance
                    </h2>

                    {/* Dark Mode Setting Row */}
                    <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-700 last:border-0">
                        {/* Left Side - Icon and Description */}
                        <div className="flex items-center gap-4">
                            {/* Icon changes based on current theme */}
                            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-orange-100 text-orange-600'}`}>
                                {isDarkMode ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
                            </div>
                            <div>
                                <h3 className="font-medium dark:text-white">Dark Mode</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Adjust the appearance to reduce eye strain
                                </p>
                            </div>
                        </div>

                        {/* Right Side - Toggle Switch Button */}
                        <button
                            onClick={toggleTheme}
                            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${isDarkMode ? 'bg-purple-600' : 'bg-gray-200'
                                }`}
                        >
                            {/* Sliding Circle Inside Toggle */}
                            <span
                                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>
                </div>
            </section>

            {/* ACCOUNT SETTINGS SECTION - Future Features (Placeholder) */}
            <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-6">
                    {/* Section Header */}
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 dark:text-white">
                        <User className="w-5 h-5 text-blue-600" />
                        Account Preferences
                    </h2>

                    {/* Disabled Placeholder Options */}
                    <div className="space-y-4 opacity-50 cursor-not-allowed">
                        {/* Notifications Option - TODO: Implement */}
                        <div className="flex items-center justify-between py-3">
                            <div className="flex items-center gap-4">
                                <Bell className="w-5 h-5 text-gray-400" />
                                <div>
                                    <h3 className="font-medium dark:text-white">Notifications</h3>
                                    <p className="text-sm text-gray-500">Manage your email and push notifications</p>
                                </div>
                            </div>
                        </div>

                        {/* Privacy Option - TODO: Implement */}
                        <div className="flex items-center justify-between py-3">
                            <div className="flex items-center gap-4">
                                <Shield className="w-5 h-5 text-gray-400" />
                                <div>
                                    <h3 className="font-medium dark:text-white">Privacy & Security</h3>
                                    <p className="text-sm text-gray-500">Manage your data and security settings</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Coming Soon Message */}
                    <p className="text-sm text-center text-gray-500 mt-4 italic">More settings coming soon!</p>
                </div>
            </section>
        </div>
    )
}

export default SettingsPage
