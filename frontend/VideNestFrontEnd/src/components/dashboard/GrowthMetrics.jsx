// ============================================
// GROWTH METRICS COMPONENT
// ============================================
// Displays growth indicators and percentage changes

import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { formatNumber, formatPercentage } from "../../utils/formatNumber"

const GrowthMetrics = ({ metrics }) => {
    // Default structure if not provided
    const last30Days = metrics?.last30Days || {
        views: 0,
        viewsGrowthPercentage: 0,
        newSubscribers: 0,
        subscriberGrowthPercentage: 0,
    }

    const {
        views,
        viewsGrowthPercentage,
        newSubscribers,
        subscriberGrowthPercentage,
    } = last30Days

    // Convert to numbers to ensure proper formatting
    const viewsGrowth = Number(viewsGrowthPercentage) || 0
    const subscriberGrowth = Number(subscriberGrowthPercentage) || 0

    const renderTrend = (percentage) => {
        if (!percentage || percentage === 0) {
            return (
                <div className="flex items-center text-gray-400 text-sm gap-1">
                    <Minus size={14} /> <span>Stable</span>
                </div>
            )
        }

        if (percentage > 0) {
            return (
                <div className="flex items-center text-green-500 text-sm gap-1">
                    <TrendingUp size={14} />
                    <span>{formatPercentage(percentage)}</span>
                </div>
            )
        }

        return (
            <div className="flex items-center text-red-500 text-sm gap-1">
                <TrendingDown size={14} />
                <span>{formatPercentage(percentage)}</span>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Views Growth */}
            <div className="bg-[#2A2D2E]/50 border border-[#2A2D2E] rounded-xl p-4">
                <p className="text-gray-400 text-sm mb-2">Last 30 Days Views</p>
                <div className="flex items-end justify-between">
                    <h3 className="text-2xl font-bold text-white">
                        {formatNumber(views)}
                    </h3>
                    {renderTrend(viewsGrowth)}
                </div>
            </div>

            {/* Subscribers Growth */}
            <div className="bg-[#2A2D2E]/50 border border-[#2A2D2E] rounded-xl p-4">
                <p className="text-gray-400 text-sm mb-2">New Subscribers</p>
                <div className="flex items-end justify-between">
                    <h3 className="text-2xl font-bold text-white">
                        +{formatNumber(newSubscribers)}
                    </h3>
                    {renderTrend(subscriberGrowth)}
                </div>
            </div>

            {/* Engagement Rate */}
            <div className="bg-[#2A2D2E]/50 border border-[#2A2D2E] rounded-xl p-4">
                <p className="text-gray-400 text-sm mb-2">Engagement Rate</p>
                <div className="flex items-end justify-between">
                    <h3 className="text-2xl font-bold text-white">
                        {metrics?.engagementRate || "0.0"}%
                    </h3>
                    <div className="flex items-center text-gray-400 text-sm gap-1">
                        <span className="text-xs">Based on likes/comments</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default GrowthMetrics
