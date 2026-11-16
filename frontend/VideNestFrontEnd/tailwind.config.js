import tailwindcssAnimate from "tailwindcss-animate"

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            fontFamily: {
                sans: [
                    "Inter",
                    "system-ui",
                    "-apple-system",
                    "BlinkMacSystemFont",
                    "Segoe UI",
                    "Roboto",
                    "sans-serif",
                ],
                heading: ["Poppins", "Inter", "system-ui", "sans-serif"],
            },
            fontSize: {
                xs: ["0.85rem", { lineHeight: "1.2rem" }],
                sm: ["0.95rem", { lineHeight: "1.4rem" }],
                base: ["1.05rem", { lineHeight: "1.6rem" }],
                lg: ["1.2rem", { lineHeight: "1.75rem" }],
                xl: ["1.35rem", { lineHeight: "1.85rem" }],
                "2xl": ["1.6rem", { lineHeight: "2.1rem" }],
                "3xl": ["2rem", { lineHeight: "2.35rem" }],
                "4xl": ["2.5rem", { lineHeight: "2.6rem" }],
            },
            keyframes: {
                shimmer: {
                    "0%": { backgroundPosition: "-200% 0" },
                    "100%": { backgroundPosition: "200% 0" },
                },
                heartPop: {
                    "0%": { transform: "scale(1)" },
                    "50%": { transform: "scale(1.3)" },
                    "100%": { transform: "scale(1)" },
                },
            },
            animation: {
                shimmer: "shimmer 2s infinite linear",
                heartPop: "heartPop 0.3s ease-out",
            },
        },
    },
    plugins: [tailwindcssAnimate],
}
