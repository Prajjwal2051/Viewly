// ============================================
// EMPTY STATE COMPONENT - NO CONTENT PLACEHOLDER
// ============================================
// Reusable component for displaying empty states with optional action button.
// Shows when data is empty (no videos, no playlists, no search results, etc.)

import React from "react"
import { Film, Upload, Sparkles } from "lucide-react"

/**
 * EMPTY STATE COMPONENT
 * 
 * Purpose:
 * - Show friendly message when there's no content to display
 * - Provide action button to help user fix the empty state
 * - Make empty pages feel intentional, not broken
 * 
 * Why empty states matter:
 * - Blank pages confuse users ("Is it broken?")
 * - Empty states explain WHY it's empty ("No videos yet")
 * - Action buttons guide users on what to do next ("Upload Video")
 * 
 * Use Cases:
 * - No videos in playlist → "Add videos to this playlist"
 * - No search results → "Try different keywords"
 * - New user with no uploads → "Upload your first video"
 * - No liked videos → "Like videos to see them here"
 * 
 * Props:
 * @param {Component} icon - Lucide icon to display (default: Film)
 * @param {string} title - Main heading (default: "No content yet")
 * @param {string} description - Explanation text
 * @param {string} actionLabel - Button text (optional)
 * @param {Function} onAction - Button click handler (optional)
 * @param {boolean} animated - Enable bounce animation (default: true)
 */
const EmptyState = ({
    icon: Icon = Film,
    title = "No content yet",
    description = "Content will appear here once available",
    actionLabel,
    onAction,
    animated = true,
}) => {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-4">
            {/* Animated Icon Container */}
            <div
                className={`relative mb-6 ${animated ? "animate-bounce" : ""}`}
            >
                <div className="absolute inset-0 bg-red-600/20 blur-2xl rounded-full" />
                <div className="relative p-6 bg-gradient-to-br from-[#2A2D2E] to-[#1E2021] rounded-full border border-red-600/30">
                    <Icon
                        className="w-16 h-16 text-red-600"
                        strokeWidth={1.5}
                    />
                </div>
                {animated && (
                    <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-pulse" />
                )}
            </div>

            {/* Text Content */}
            <h3 className="text-2xl font-bold text-white mb-2 text-center">
                {title}
            </h3>
            <p className="text-gray-400 text-center max-w-md mb-6">
                {description}
            </p>

            {/* Action Button */}
            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="group relative px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg shadow-red-600/30 overflow-hidden"
                >
                    <span className="relative z-10 flex items-center gap-2">
                        <Upload className="w-5 h-5 transition-transform group-hover:rotate-12" />
                        {actionLabel}
                    </span>
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                </button>
            )}
        </div>
    )
}

export default EmptyState
