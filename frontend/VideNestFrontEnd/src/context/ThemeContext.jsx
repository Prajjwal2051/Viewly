import { createContext, useContext, useEffect, useState } from "react"

const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
    // Force dark mode state
    const [isDarkMode] = useState(true)

    // Ensure dark class is ADDED and theme is set to dark
    useEffect(() => {
        const root = window.document.documentElement
        root.classList.add("dark")
        localStorage.setItem("theme", "dark")
    }, [])

    const toggleTheme = () => {
        // No-op: Light mode is disabled
        console.log("Light mode is disabled")
    }

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => useContext(ThemeContext)
