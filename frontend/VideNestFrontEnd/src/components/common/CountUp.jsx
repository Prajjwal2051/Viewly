// ============================================
// COUNT UP COMPONENT - ANIMATED NUMBER COUNTER
// ============================================
// Animates a number from 0 to a target value with smooth easing.
// Creates engaging dashboard statistics with visual appeal.

import { useState, useEffect } from "react"

/**
 * COUNT UP COMPONENT
 * 
 * Purpose:
 * - Animates numbers from 0 to target value
 * - Makes statistics feel more dynamic and impressive
 * - Uses smooth easing for natural motion
 * 
 * Technical Details:
 * - Uses requestAnimationFrame for 60fps smooth animation
 * - Implements easeOutExpo easing function (fast start, slow end)
 * - Automatically formats numbers with commas (1,234,567)
 * 
 * Common Use Cases:
 * - Dashboard statistics (views, subscribers, likes)
 * - Analytics metrics display
 * - Profile page stats
 * 
 * Why use animation instead of instant numbers?
 * - Creates visual interest and draws attention
 * - Makes numbers feel more impactful
 * - Gives users time to process the information
 * 
 * @param {number} end - Target number to count up to
 * @param {number} duration - Animation duration in milliseconds (default: 2000ms)
 * @param {string} suffix - Text to append after number (e.g., "+", "K", "%")
 * 
 * @example
 * <CountUp end={1500} duration={2000} suffix="+" />
 * // Animates from 0 to "1,500+" over 2 seconds
 */
const CountUp = ({ end, duration = 2000, suffix = "" }) => {
    const [count, setCount] = useState(0)

    useEffect(() => {
        let startTime = null
        const start = 0

        // Easing function: easeOutExpo
        // Starts fast and decelerates gracefully
        const easeOutExpo = (x) => {
            return x === 1 ? 1 : 1 - Math.pow(2, -10 * x)
        }

        const animate = (currentTime) => {
            if (!startTime) startTime = currentTime
            const timeElapsed = currentTime - startTime
            const progress = Math.min(timeElapsed / duration, 1)

            const easedProgress = easeOutExpo(progress)
            const currentCount = Math.floor(
                easedProgress * (end - start) + start
            )

            setCount(currentCount)

            if (progress < 1) {
                requestAnimationFrame(animate)
            }
        }

        requestAnimationFrame(animate)
    }, [end, duration])

    return (
        <span>
            {count.toLocaleString()}
            {suffix}
        </span>
    )
}

export default CountUp
