// ============================================
// OFFLINE BANNER COMPONENT
// ============================================
// Displays banner when user loses internet connection

import { useEffect, useState } from "react"
import { Wifi, WifiOff } from "lucide-react"

const OfflineBanner = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine)
    const [showBanner, setShowBanner] = useState(!navigator.onLine)

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true)
            // Show "Back online" briefly
            setShowBanner(true)
            setTimeout(() => setShowBanner(false), 3000)
        }

        const handleOffline = () => {
            setIsOnline(false)
            setShowBanner(true)
        }

        window.addEventListener("online", handleOnline)
        window.addEventListener("offline", handleOffline)

        return () => {
            window.removeEventListener("online", handleOnline)
            window.removeEventListener("offline", handleOffline)
        }
    }, [])

    if (!showBanner) return null

    return (
        <div
            className={`fixed top-0 left-0 right-0 z-50 px-4 py-3 text-center text-white font-medium transition-all ${
                isOnline ? "bg-green-600" : "bg-red-600"
            }`}
        >
            <div className="flex items-center justify-center gap-2">
                {isOnline ? (
                    <>
                        <Wifi size={20} />
                        <span>✓ Back online</span>
                    </>
                ) : (
                    <>
                        <WifiOff size={20} />
                        <span>
                            📡 You're offline. Some features may not work.
                        </span>
                    </>
                )}
            </div>
        </div>
    )
}

export default OfflineBanner
