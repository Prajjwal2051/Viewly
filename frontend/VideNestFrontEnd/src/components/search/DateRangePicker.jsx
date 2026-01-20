// ============================================
// DATE RANGE PICKER COMPONENT - UPLOAD DATE FILTER
// ============================================
// Allows users to filter search results by video upload date range.
// Uses native HTML date inputs for consistent cross-browser experience.

import { useState } from "react"
import { Calendar } from "lucide-react"

/**
 * DATE RANGE PICKER COMPONENT
 * 
 * Purpose:
 * - Filter videos by upload date
 * - Find recent content or older videos
 * - Discover trending content from specific time periods
 * 
 * How it works:
 * - Click calendar button to open date picker
 * - Select start date (from when)
 * - Select end date (until when)
 * - Dates automatically filter search results
 * 
 * Common Use Cases:
 * - Find videos uploaded this week/month
 * - Browse content from a specific event date
 * - Exclude very old videos from results
 * - Find timely news content
 * 
 * UX Features:
 * - Dropdown panel for space efficiency
 * - Shows selected date range on button
 * - Clear button to reset dates
 * - Backdrop closes picker on outside click
 * 
 * Technical Details:
 * - Uses native <input type="date"> for accessibility
 * - Formatted display: "Jan 15, 2024"
 * - Validates start date < end date (browser enforced)
 * 
 * @param {string} startDate - Start of date range (ISO format)
 * @param {string} endDate - End of date range (ISO format)
 * @param {Function} onChange - Callback to update date filter
 */

const DateRangePicker = ({ startDate, endDate, onChange }) => {
    const [showPicker, setShowPicker] = useState(false)

    const formatDate = (dateString) => {
        if (!dateString) return ""
        const date = new Date(dateString)
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        })
    }

    const handleStartDateChange = (e) => {
        onChange("startDate", e.target.value)
    }

    const handleEndDateChange = (e) => {
        onChange("endDate", e.target.value)
    }

    const clearDates = () => {
        onChange("startDate", "")
        onChange("endDate", "")
    }

    const hasDateFilter = startDate || endDate

    return (
        <div className="relative">
            <button
                onClick={() => setShowPicker(!showPicker)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${hasDateFilter
                        ? "bg-red-600 text-white"
                        : "bg-[#2A2D2E] text-gray-300 hover:bg-[#323638]"
                    }`}
            >
                <Calendar size={16} />
                <span>
                    {hasDateFilter
                        ? `${formatDate(startDate) || "Any"} - ${formatDate(endDate) || "Now"}`
                        : "Upload Date"}
                </span>
            </button>

            {showPicker && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowPicker(false)}
                    />

                    {/* Picker Dropdown */}
                    <div className="absolute top-full left-0 mt-2 bg-[#1E2021] border border-[#2A2D2E] rounded-xl p-4 shadow-2xl z-20 min-w-[280px]">
                        <h4 className="text-sm font-bold text-white mb-3">
                            Upload Date Range
                        </h4>

                        <div className="space-y-3">
                            {/* Start Date */}
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">
                                    From
                                </label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={handleStartDateChange}
                                    max={
                                        endDate ||
                                        new Date().toISOString().split("T")[0]
                                    }
                                    className="w-full bg-[#2A2D2E] border border-[#323638] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                                />
                            </div>

                            {/* End Date */}
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">
                                    To
                                </label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={handleEndDateChange}
                                    min={startDate}
                                    max={new Date().toISOString().split("T")[0]}
                                    className="w-full bg-[#2A2D2E] border border-[#323638] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 mt-4 pt-3 border-t border-[#2A2D2E]">
                            <button
                                onClick={clearDates}
                                className="flex-1 px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-[#2A2D2E] rounded-lg transition-colors"
                            >
                                Clear
                            </button>
                            <button
                                onClick={() => setShowPicker(false)}
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

export default DateRangePicker
