// ============================================
// FORMAT NUMBER UTILITY
// ============================================
// Formats large numbers into readable K/M format

/**
 * Format number with K/M suffix for large values
 * @param {number} num - Number to format
 * @returns {string} Formatted string (e.g., "1.2K", "1.5M")
 */
export const formatNumber = (num) => {
    if (!num || isNaN(num)) return "0"

    if (num >= 1_000_000) {
        return `${(num / 1_000_000).toFixed(1)}M`
    }
    if (num >= 1_000) {
        return `${(num / 1_000).toFixed(1)}K`
    }
    return num.toString()
}

/**
 * Format count with commas for readability
 * @param {number} num - Number to format
 * @returns {string} Formatted string with commas
 */
export const formatCount = (num) => {
    if (!num || isNaN(num)) return "0"
    return num.toLocaleString()
}

/**
 * Format duration in seconds to MM:SS or HH:MM:SS
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration string
 */
export const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00"

    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`
}

/**
 * Format percentage
 * @param {number} value - Percentage value
 * @returns {string} Formatted percentage with sign
 */
export const formatPercentage = (value) => {
    const num = Number(value)
    if (!value || isNaN(num)) return "0%"
    const sign = num > 0 ? "+" : ""
    return `${sign}${num.toFixed(1)}%`
}
