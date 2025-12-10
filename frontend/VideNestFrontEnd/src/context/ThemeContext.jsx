import { createContext, useContext, useEffect, useState } from "react"

const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
    // Check localStorage or system preference on initial load
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== "undefined") {
            const savedTheme = localStorage.getItem("theme")
            if (savedTheme) {
                return savedTheme === "dark"
            }
            return window.matchMedia("(prefers-color-scheme: dark)").matches
        }
        return false
    })

    // Update class and storage when theme changes
    useEffect(() => {
        const root = window.document.documentElement
        if (isDarkMode) {
            root.classList.add("dark")
            localStorage.setItem("theme", "dark")
        } else {
            root.classList.remove("dark")
            localStorage.setItem("theme", "light")
        }
    }, [isDarkMode])

    const toggleTheme = () => {
        setIsDarkMode((prev) => !prev)
    }

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => useContext(ThemeContext)
