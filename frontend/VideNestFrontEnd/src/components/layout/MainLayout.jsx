// ============================================
// MAIN LAYOUT - PAGE WRAPPER COMPONENT
// ============================================
// Wraps all protected pages with consistent Header + Navigation.
// Creates the app shell: header at top, nav at bottom, content in middle.

import Header from "./ui/layout/Header.jsx"
import Navigation from "./ui/layout/Navigation.jsx"

/**
 * Props:
 * - children: The page content to render (HomePage, ProfilePage, etc.)
 *
 * Layout Structure:
 * - Header: Sticky top bar with search, notifications, user menu
 * - Main: Scrollable content area with max-width constraint
 * - Navigation: Fixed bottom bar with main navigation icons
 */
const MainLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* HEADER - Sticky at top, follows user on scroll */}
            <Header />

            {/* MAIN CONTENT - Centered with max-width, bottom padding for nav bar */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-20">
                {children} {/* Renders the current page component */}
            </main>

            {/* BOTTOM NAVIGATION - Fixed at bottom, mobile-first design */}
            <Navigation />
        </div>
    )
}

export default MainLayout
