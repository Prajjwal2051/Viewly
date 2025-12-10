// ============================================
// THEME CONTEXT - DARK MODE MANAGEMENT
// ============================================
// Provides theme state to entire app using React Context API.
// Currently enforces dark mode (light mode disabled).

import { createContext, useContext, useEffect, useState } from "react"

/**
 * CREATE THEME CONTEXT
 * Context allows passing data through component tree without props
 * Any component can access theme state via useTheme() hook
 */
const ThemeContext = createContext()

/**
 * THEME PROVIDER COMPONENT
 * Wraps entire app to provide theme state to all components
 *
 * Props:
 * - children: The app components wrapped by this provider
 */
export const ThemeProvider = ({ children }) => {
    // Force dark mode (light mode currently disabled)
    const [isDarkMode] = useState(true)

    /**
     * INITIALIZE DARK MODE ON MOUNT
     * Runs once when app loads
     * - Adds 'dark' class to <html> element (Tailwind uses this)
     * - Saves preference to localStorage for persistence
     */
    useEffect(() => {
        const root = window.document.documentElement
        root.classList.add("dark")
        localStorage.setItem("theme", "dark")
    }, [])

    /**
     * TOGGLE THEME FUNCTION
     * Currently disabled - logs message instead of switching
     * To enable: implement logic to toggle isDarkMode state and class
     */
    const toggleTheme = () => {
        // No-op: Light mode is disabled
        console.log("Light mode is disabled")
    }

    // Provide theme state and toggle function to all children
    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

/**
 * USE THEME HOOK
 * Custom hook to access theme context in components
 *
 * Usage:
 * const { isDarkMode, toggleTheme } = useTheme()
 */
export const useTheme = () => useContext(ThemeContext)
