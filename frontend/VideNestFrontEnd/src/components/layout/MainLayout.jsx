// ============================================
// MAIN LAYOUT - PAGE WRAPPER COMPONENT
// ============================================
// Wraps all protected pages with consistent navigation.
// Mobile: Bottom navigation bar
// Desktop: Left sidebar navigation

import Header from "./ui/layout/Header.jsx"
import Sidebar from "./ui/layout/Sidebar.jsx"

/**
 * Props:
 * - children: The page content to render (HomePage, ProfilePage, etc.)
 *
 * Layout Structure:
 * Mobile: Bottom nav bar, content fills screen
 * Desktop: Sidebar left, Header top, content offset by sidebar
 */
const MainLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-black text-white">
            {/* SIDEBAR - Responsive (bottom on mobile, left on desktop) */}
            <Sidebar />

            {/* MAIN WRAPPER - Responsive padding */}
            <div className="md:pl-20 xl:pl-64 pb-16 md:pb-0 min-h-screen transition-all duration-300">
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
