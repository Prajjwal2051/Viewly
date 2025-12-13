/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
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
                xs: ["0.85rem", { lineHeight: "1.2rem" }], // Increased from 0.75rem (12px -> ~13.6px)
                sm: ["0.95rem", { lineHeight: "1.4rem" }], // Increased from 0.875rem (14px -> ~15.2px)
                base: ["1.05rem", { lineHeight: "1.6rem" }], // Increased from 1rem (16px -> ~16.8px)
                lg: ["1.2rem", { lineHeight: "1.75rem" }], // Increased from 1.125rem (18px -> ~19.2px)
                xl: ["1.35rem", { lineHeight: "1.85rem" }], // Increased from 1.25rem (20px -> ~21.6px)
                "2xl": ["1.6rem", { lineHeight: "2.1rem" }], // Increased from 1.5rem
                "3xl": ["2rem", { lineHeight: "2.35rem" }], // Increased from 1.875rem
                "4xl": ["2.5rem", { lineHeight: "2.6rem" }], // Increased from 2.25rem
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
    plugins: [],
}
