// ============================================
// LOADING SPINNER COMPONENT
// ============================================
// Reusable loading indicator for Suspense fallbacks and async operations

import { Loader2 } from "lucide-react"

/**
 * LOADING SPINNER
 *
 * Purpose:
 * - Provides consistent loading UI across the app
 * - Used as Suspense fallback for lazy-loaded components
 * - Can be used for any async operation
 *
 * Usage:
 * <Suspense fallback={<LoadingSpinner />}>
 *   <LazyComponent />
 * </Suspense>
 */
const LoadingSpinner = ({ fullScreen = true, size = "large" }) => {
    const sizeClasses = {
        small: "w-6 h-6",
        medium: "w-10 h-10",
        large: "w-12 h-12",
    }

    const containerClasses = fullScreen
        ? "flex items-center justify-center h-screen bg-[#1E2021]"
        : "flex items-center justify-center p-8"

    return (
        <div className={containerClasses}>
            <Loader2
                className={`${sizeClasses[size]} animate-spin text-red-600`}
                aria-label="Loading..."
            />
        </div>
    )
}

export default LoadingSpinner
