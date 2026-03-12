// ============================================================
// Copyright (c) 2026 Prajjwal (github.com/Prajjwal2051)
// Project : VidNest — Video Sharing Platform
// License : Proprietary — All Rights Reserved
// Unauthorized copying, modification, or distribution of this
// file, via any medium, is strictly prohibited.
// ============================================================
// ============================================
// USE SEARCH PARAMS HOOK
// ============================================
// Custom hook to manage search parameters in URL

import { useSearchParams as useRouterSearchParams } from "react-router-dom"
import { useMemo } from "react"

export const useSearchParams = () => {
    const [searchParams, setSearchParams] = useRouterSearchParams()

    const filters = useMemo(() => {
        return {
            query: searchParams.get("query") || "",
            category: searchParams.get("category") || "",
            sortBy: searchParams.get("sortBy") || "relevance",
            minDuration: searchParams.get("minDuration") || "",
            maxDuration: searchParams.get("maxDuration") || "",
            startDate: searchParams.get("startDate") || "",
            endDate: searchParams.get("endDate") || "",
        }
    }, [searchParams])

    const updateFilter = (key, value) => {
        setSearchParams((prev) => {
            const newParams = new URLSearchParams(prev)
            if (value) {
                newParams.set(key, value)
            } else {
                newParams.delete(key)
            }
            // Reset page on filter change
            newParams.set("page", "1")
            return newParams
        })
    }

    const clearFilters = () => {
        setSearchParams((prev) => {
            const newParams = new URLSearchParams()
            // Keep the query if it exists
            const query = prev.get("query")
            if (query) newParams.set("query", query)
            return newParams
        })
    }

    return { filters, updateFilter, clearFilters }
}
