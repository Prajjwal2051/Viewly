import { createContext, useContext, useEffect, useState } from "react"

const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
    // Force light mode state
    const [isDarkMode] = useState(false)

    // Ensure dark class is removed and theme is set to light
    useEffect(() => {
        const root = window.document.documentElement
        root.classList.remove("dark")
        localStorage.setItem("theme", "light")
    }, [])

    const toggleTheme = () => {
        // No-op: Dark mode is disabled
        console.log("Dark mode is disabled")
    }

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => useContext(ThemeContext)
