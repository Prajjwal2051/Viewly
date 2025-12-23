// ============================================
// COUNT UP COMPONENT
// ============================================
// Animates a number from 0 to a target value
// Uses easeOutExpo for smooth deceleration

import { useState, useEffect } from "react"

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
