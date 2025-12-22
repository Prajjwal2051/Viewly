// ============================================
// SEARCH FILTERS COMPONENT
// ============================================
// Advanced filters for search results including category, date, and duration

import { useState } from "react"
import { Filter, X, ChevronDown, ChevronUp } from "lucide-react"
import DateRangePicker from "./DateRangePicker"
import DurationSlider from "./DurationSlider"

const CATEGORIES = [
    "Music",
    "Gaming",
    "News",
    "Sports",
    "Education",
    "Technology",
    "Entertainment",
    "Comedy",
    "Travel",
]

const SORT_OPTIONS = [
    { value: "relevance", label: "Relevance" },
    { value: "views", label: "View Count" },
    { value: "date", label: "Upload Date" },
    { value: "likes", label: "Most Liked" },
]

const SearchFilters = ({ filters, onFilterChange, onClearFilters }) => {
    const [isOpen, setIsOpen] = useState(false)

    const handleCategoryToggle = (category) => {
        const currentCategories = filters.category
            ? filters.category.split(",")
            : []
        let newCategories

        if (currentCategories.includes(category)) {
            newCategories = currentCategories.filter((c) => c !== category)
        } else {
            newCategories = [...currentCategories, category]
        }

        onFilterChange("category", newCategories.join(","))
    }

    const activeFilterCount = Object.values(filters).filter(Boolean).length

    return (
        <div className="mb-6">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                    isOpen || activeFilterCount > 0
                        ? "bg-red-600 text-white"
                        : "bg-[#2A2D2E] text-gray-300 hover:bg-[#323638]"
                }`}
            >
                <Filter size={18} />
                <span className="font-medium">Filters</span>
                {activeFilterCount > 0 && (
                    <span className="bg-white text-red-600 text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                        {activeFilterCount}
                    </span>
                )}
                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {isOpen && (
                <div className="mt-4 bg-[#1E2021] border border-[#2A2D2E] rounded-xl p-6 animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Categories */}
                        <div className="md:col-span-2">
                            <h3 className="text-sm font-bold text-gray-400 uppercase mb-3">
                                Categories
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {CATEGORIES.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() =>
                                            handleCategoryToggle(category)
                                        }
                                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                                            (filters.category || "").includes(
                                                category
                                            )
                                                ? "bg-red-600 text-white"
                                                : "bg-[#2A2D2E] text-gray-300 hover:bg-[#323638]"
                                        }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Sort By */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-400 uppercase mb-3">
                                Sort By
                            </h3>
                            <div className="flex flex-col gap-2">
                                {SORT_OPTIONS.map((option) => (
                                    <label
                                        key={option.value}
                                        className="flex items-center gap-2 cursor-pointer group"
                                    >
                                        <div
                                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                                filters.sortBy === option.value
                                                    ? "border-red-600 bg-red-600"
                                                    : "border-gray-600 group-hover:border-gray-400"
                                            }`}
                                        >
                                            {filters.sortBy ===
                                                option.value && (
                                                <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                            )}
                                        </div>
                                        <input
                                            type="radio"
                                            name="sortBy"
                                            className="hidden"
                                            checked={
                                                filters.sortBy === option.value
                                            }
                                            onChange={() =>
                                                onFilterChange(
                                                    "sortBy",
                                                    option.value
                                                )
                                            }
                                        />
                                        <span
                                            className={
                                                filters.sortBy === option.value
                                                    ? "text-white"
                                                    : "text-gray-400"
                                            }
                                        >
                                            {option.label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Date Range & Duration - Side by Side */}
                        <div className="md:col-span-2">
                            <h3 className="text-sm font-bold text-gray-400 uppercase mb-3">
                                Filters
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                <DateRangePicker
                                    startDate={filters.startDate}
                                    endDate={filters.endDate}
                                    onChange={onFilterChange}
                                />
                                <DurationSlider
                                    minDuration={filters.minDuration}
                                    maxDuration={filters.maxDuration}
                                    onChange={onFilterChange}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex justify-end gap-3 pt-6 border-t border-[#2A2D2E]">
                        <button
                            onClick={onClearFilters}
                            className="text-gray-400 hover:text-white text-sm font-medium px-4 py-2 hover:bg-[#2A2D2E] rounded-lg transition-colors flex items-center gap-2"
                        >
                            <X size={16} />
                            Clear All Filters
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default SearchFilters
