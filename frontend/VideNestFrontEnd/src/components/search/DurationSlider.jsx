// ============================================
// DURATION SLIDER COMPONENT - VIDEO LENGTH FILTER
// ============================================
// Custom dual-range slider for filtering videos by duration.
// Allows users to set minimum and maximum video length in seconds.

import { useState, useEffect } from "react"
import { Clock } from "lucide-react"

/**
 * DURATION SLIDER COMPONENT
 * 
 * Purpose:
 * - Filter search results by video length
 * - Find videos within specific duration range
 * - Useful for finding quick content or long-form videos
 * 
 * How it works:
 * - Two sliders: minimum and maximum duration
 * - Range: 0 seconds to 3600 seconds (1 hour)
 * - Live preview shows selected range
 * - Apply button confirms selection
 * 
 * Common Use Cases:
 * - Find short videos (< 5 min) for quick viewing
 * - Find long tutorials (> 20 min) for in-depth learning
 * - Exclude very long videos when browsing casually
 * 
 * Technical Details:
 * - Uses HTML range input for accessibility
 * - Formats seconds to MM:SS display
 * - Local state prevents API calls on every drag
 * - Apply button sends final filter to parent
 * 
 * @param {string} minDuration - Current minimum duration filter (seconds)
 * @param {string} maxDuration - Current maximum duration filter (seconds)
 * @param {Function} onChange - Callback to update filter values
 */

const DurationSlider = ({ minDuration, maxDuration, onChange }) => {
    const [showSlider, setShowSlider] = useState(false)
    const [localMin, setLocalMin] = useState(
        minDuration ? parseInt(minDuration) : 0
    )
    const [localMax, setLocalMax] = useState(
        maxDuration ? parseInt(maxDuration) : 3600
    )

    const MAX_DURATION = 3600 // 1 hour in seconds

    useEffect(() => {
        setLocalMin(minDuration ? parseInt(minDuration) : 0)
        setLocalMax(maxDuration ? parseInt(maxDuration) : MAX_DURATION)
    }, [minDuration, maxDuration])

    const formatDuration = (seconds) => {
        if (seconds === 0) return "0:00"
        if (seconds >= 3600) return "1:00:00+"

        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, "0")}`
    }

    const handleMinChange = (e) => {
        const value = parseInt(e.target.value)
        if (value <= localMax) {
            setLocalMin(value)
        }
    }

    const handleMaxChange = (e) => {
        const value = parseInt(e.target.value)
        if (value >= localMin) {
            setLocalMax(value)
        }
    }

    const applyFilter = () => {
        onChange("minDuration", localMin > 0 ? localMin.toString() : "")
        onChange(
            "maxDuration",
            localMax < MAX_DURATION ? localMax.toString() : ""
        )
        setShowSlider(false)
    }

    const clearFilter = () => {
        setLocalMin(0)
        setLocalMax(MAX_DURATION)
        onChange("minDuration", "")
        onChange("maxDuration", "")
    }

    const hasFilter =
        minDuration || (maxDuration && parseInt(maxDuration) < MAX_DURATION)

    return (
        <div className="relative">
            <button
                onClick={() => setShowSlider(!showSlider)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${hasFilter
                        ? "bg-red-600 text-white"
                        : "bg-[#2A2D2E] text-gray-300 hover:bg-[#323638]"
                    }`}
            >
                <Clock size={16} />
                <span>
                    {hasFilter
                        ? `${formatDuration(localMin)} - ${formatDuration(localMax)}`
                        : "Any Duration"}
                </span>
            </button>

            {showSlider && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowSlider(false)}
                    />

                    {/* Slider Dropdown */}
                    <div className="absolute top-full left-0 mt-2 bg-[#1E2021] border border-[#2A2D2E] rounded-xl p-4 shadow-2xl z-20 min-w-[320px]">
                        <h4 className="text-sm font-bold text-white mb-4">
                            Video Duration
                        </h4>

                        {/* Duration Display */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-center">
                                <div className="text-xs text-gray-400 mb-1">
                                    Min
                                </div>
                                <div className="text-lg font-bold text-white">
                                    {formatDuration(localMin)}
                                </div>
                            </div>
                            <div className="text-gray-600">—</div>
                            <div className="text-center">
                                <div className="text-xs text-gray-400 mb-1">
                                    Max
                                </div>
                                <div className="text-lg font-bold text-white">
                                    {formatDuration(localMax)}
                                </div>
                            </div>
                        </div>

                        {/* Min Slider */}
                        <div className="mb-4">
                            <label className="block text-xs text-gray-400 mb-2">
                                Minimum Duration
                            </label>
                            <input
                                type="range"
                                min="0"
                                max={MAX_DURATION}
                                step="60"
                                value={localMin}
                                onChange={handleMinChange}
                                className="w-full h-2 bg-[#2A2D2E] rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-red-600 [&::-webkit-slider-thumb]:cursor-pointer"
                                style={{
                                    background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${(localMin / MAX_DURATION) * 100}%, #2A2D2E ${(localMin / MAX_DURATION) * 100}%, #2A2D2E 100%)`,
                                }}
                            />
                        </div>

                        {/* Max Slider */}
                        <div className="mb-4">
                            <label className="block text-xs text-gray-400 mb-2">
                                Maximum Duration
                            </label>
                            <input
                                type="range"
                                min="0"
                                max={MAX_DURATION}
                                step="60"
                                value={localMax}
                                onChange={handleMaxChange}
                                className="w-full h-2 bg-[#2A2D2E] rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-red-600 [&::-webkit-slider-thumb]:cursor-pointer"
                                style={{
                                    background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${(localMax / MAX_DURATION) * 100}%, #2A2D2E ${(localMax / MAX_DURATION) * 100}%, #2A2D2E 100%)`,
                                }}
                            />
                        </div>

                        {/* Quick Presets */}
                        <div className="mb-4">
                            <div className="text-xs text-gray-400 mb-2">
                                Quick Select
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => {
                                        setLocalMin(0)
                                        setLocalMax(300)
                                    }}
                                    className="px-2 py-1 text-xs bg-[#2A2D2E] text-gray-300 rounded hover:bg-[#323638]"
                                >
                                    Under 5 min
                                </button>
                                <button
                                    onClick={() => {
                                        setLocalMin(300)
                                        setLocalMax(1200)
                                    }}
                                    className="px-2 py-1 text-xs bg-[#2A2D2E] text-gray-300 rounded hover:bg-[#323638]"
                                >
                                    5-20 min
                                </button>
                                <button
                                    onClick={() => {
                                        setLocalMin(1200)
                                        setLocalMax(MAX_DURATION)
                                    }}
                                    className="px-2 py-1 text-xs bg-[#2A2D2E] text-gray-300 rounded hover:bg-[#323638]"
                                >
                                    Over 20 min
                                </button>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-3 border-t border-[#2A2D2E]">
                            <button
                                onClick={clearFilter}
                                className="flex-1 px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-[#2A2D2E] rounded-lg transition-colors"
                            >
                                Clear
                            </button>
                            <button
                                onClick={applyFilter}
                                className="flex-1 px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export default DurationSlider
