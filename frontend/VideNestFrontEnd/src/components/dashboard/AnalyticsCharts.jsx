// ============================================
// ANALYTICS CHARTS COMPONENT
// ============================================
// Displays visual charts for channel performance using Recharts

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
} from "recharts"

const AnalyticsCharts = ({ data }) => {
    // Default empty data if not provided
    const viewsData = data?.viewsGrowth || []
    const subscribersData = data?.subscribersGrowth || []

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Views Growth Chart */}
            <div className="bg-[#2A2D2E]/50 border border-[#2A2D2E] rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-6">
                    Views Growth (Last 30 Days)
                </h3>

                <div className="w-full h-[300px] min-w-0">
                    {viewsData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={viewsData}>
                                <defs>
                                    <linearGradient
                                        id="colorViews"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor="#ef4444"
                                            stopOpacity={0.3}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor="#ef4444"
                                            stopOpacity={0}
                                        />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#374151"
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="_id"
                                    stroke="#9ca3af"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#9ca3af"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) =>
                                        value >= 1000
                                            ? `${(value / 1000).toFixed(1)}k`
                                            : value
                                    }
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#1f2937",
                                        borderColor: "#374151",
                                        color: "#fff",
                                    }}
                                    itemStyle={{ color: "#fff" }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="totalViews"
                                    stroke="#ef4444"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorViews)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-500">
                            No data available
                        </div>
                    )}
                </div>
            </div>

            {/* Subscribers Growth Chart */}
            <div className="bg-[#2A2D2E]/50 border border-[#2A2D2E] rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-6">
                    Subscribers Growth
                </h3>

                <div className="w-full h-[300px] min-w-0">
                    {subscribersData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={subscribersData}>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#374151"
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="_id"
                                    stroke="#9ca3af"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#9ca3af"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#1f2937",
                                        borderColor: "#374151",
                                        color: "#fff",
                                    }}
                                    itemStyle={{ color: "#fff" }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="newSubscribers"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: "#3b82f6" }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-500">
                            No data available
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default AnalyticsCharts
