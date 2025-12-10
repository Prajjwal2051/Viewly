// ============================================
// MAIN LAYOUT - PAGE WRAPPER COMPONENT
// ============================================
// Wraps all protected pages with consistent Header + Navigation.
// Creates the app shell: header at top, nav at bottom, content in middle.

import Header from "./ui/layout/Header.jsx"
import Sidebar from "./ui/layout/Sidebar.jsx"

/**
 * Props:
 * - children: The page content to render (HomePage, ProfilePage, etc.)
 *
 * Layout Structure:
 * - Sidebar: Fixed left navigation
 * - Header: Fixed top bar (offset by sidebar width)
 * - Main: Content area (offset by sidebar and header)
 */
const MainLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-black text-white">
            {/* SIDEBAR - Fixed left */}
            <Sidebar />

            {/* MAIN WRAPPER - Offset by sidebar width */}
            <div className="pl-20 xl:pl-64 min-h-screen transition-all duration-300">
                {/* HEADER - Sticky at top */}
                <Header />

                {/* MAIN CONTENT */}
                <main className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {children}
                </main>
            </div>
        </div>
    )
}

export default MainLayout
