// ============================================
// USE DEBOUNCE HOOK
// ============================================
// Custom React hook for debouncing values and functions

import { useEffect, useState, useCallback, useRef } from "react"

/**
 * DEBOUNCE VALUE HOOK
 * Delays updating a value until after a specified delay
 * Useful for search inputs, filters, etc.
 *
 * @param {any} value - The value to debounce
 * @param {number} delay - Delay in milliseconds (default: 500ms)
 * @returns {any} - The debounced value
 *
 * @example
 * const [searchTerm, setSearchTerm] = useState("")
 * const debouncedSearch = useDebounce(searchTerm, 300)
 *
 * useEffect(() => {
 *   // API call only happens after user stops typing for 300ms
 *   fetchResults(debouncedSearch)
 * }, [debouncedSearch])
 */
export const useDebounce = (value, delay = 500) => {
    const [debouncedValue, setDebouncedValue] = useState(value)

    useEffect(() => {
        // Set up timeout to update debounced value
        const handler = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        // Clean up timeout if value changes before delay completes
        return () => {
            clearTimeout(handler)
        }
    }, [value, delay])

    return debouncedValue
}

/**
 * DEBOUNCE CALLBACK HOOK
 * Returns a debounced version of a callback function
 * Useful for event handlers like onClick, onChange, etc.
 *
 * @param {Function} callback - The function to debounce
 * @param {number} delay - Delay in milliseconds (default: 300ms)
 * @returns {Function} - The debounced function
 *
 * @example
 * const handleLike = useDebounceCallback(() => {
 *   toggleLike(videoId)
 * }, 300)
 *
 * <button onClick={handleLike}>Like</button>
 */
export const useDebounceCallback = (callback, delay = 300) => {
    const timeoutRef = useRef(null)

    const debouncedCallback = useCallback(
        (...args) => {
            // Clear existing timeout
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }

            // Set new timeout
            timeoutRef.current = setTimeout(() => {
                callback(...args)
            }, delay)
        },
        [callback, delay]
    )

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [])

    return debouncedCallback
}

/**
 * THROTTLE CALLBACK HOOK
 * Returns a throttled version of a callback function
 * Ensures function is called at most once per specified interval
 * Useful for scroll handlers, resize handlers, etc.
 *
 * @param {Function} callback - The function to throttle
 * @param {number} limit - Minimum time between calls in milliseconds (default: 1000ms)
 * @returns {Function} - The throttled function
 *
 * @example
 * const handleScroll = useThrottleCallback(() => {
 *   console.log('Scrolled!')
 * }, 1000)
 *
 * <div onScroll={handleScroll}>...</div>
 */
export const useThrottleCallback = (callback, limit = 1000) => {
    const inThrottle = useRef(false)

    const throttledCallback = useCallback(
        (...args) => {
            if (!inThrottle.current) {
                callback(...args)
                inThrottle.current = true
                setTimeout(() => {
                    inThrottle.current = false
                }, limit)
            }
        },
        [callback, limit]
    )

    return throttledCallback
}

export default useDebounce
