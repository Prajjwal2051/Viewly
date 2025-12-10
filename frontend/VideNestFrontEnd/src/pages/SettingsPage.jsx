import { useTheme } from "../context/ThemeContext"
import { Moon, Sun, User, Bell, Shield, Smartphone } from "lucide-react"

const SettingsPage = () => {
    const { isDarkMode, toggleTheme } = useTheme()

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 dark:text-white">Settings</h1>

            {/* Appearance Section */}
            <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-6">
                <div className="p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 dark:text-white">
                        <Smartphone className="w-5 h-5 text-purple-600" />
                        Appearance
                    </h2>
                    
                    <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-700 last:border-0">
                        <div className="flex items-center gap-4">
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

                        {/* Toggle Switch */}
                        <button
                            onClick={toggleTheme}
                            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                                isDarkMode ? 'bg-purple-600' : 'bg-gray-200'
                            }`}
                        >
                            <span
                                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                                    isDarkMode ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                        </button>
                    </div>
                </div>
            </section>

            {/* Account Settings (Placeholder) */}
            <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 dark:text-white">
                        <User className="w-5 h-5 text-blue-600" />
                        Account Preferences
                    </h2>
                    
                    <div className="space-y-4 opacity-50 cursor-not-allowed">
                        <div className="flex items-center justify-between py-3">
                            <div className="flex items-center gap-4">
                                <Bell className="w-5 h-5 text-gray-400" />
                                <div>
                                    <h3 className="font-medium dark:text-white">Notifications</h3>
                                    <p className="text-sm text-gray-500">Manage your email and push notifications</p>
                                </div>
                            </div>
                        </div>

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
                    <p className="text-sm text-center text-gray-500 mt-4 italic">More settings coming soon!</p>
                </div>
            </section>
        </div>
    )
}

export default SettingsPage
