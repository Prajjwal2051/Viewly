import React, { useEffect } from "react"
import { X, CheckCircle, AlertCircle, Info } from "lucide-react"

const Toast = ({ message, type = "success", onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose()
        }, duration)

        return () => clearTimeout(timer)
    }, [duration, onClose])

    const icons = {
        success: <CheckCircle className="w-5 h-5" />,
        error: <AlertCircle className="w-5 h-5" />,
        info: <Info className="w-5 h-5" />,
    }

    const colors = {
        success: "bg-green-600",
        error: "bg-red-600",
        info: "bg-blue-600",
    }

    return (
        <div
            className={`fixed top-4 right-4 z-50 ${colors[type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] animate-in slide-in-from-top-2 duration-300`}
        >
            {icons[type]}
            <span className="flex-1 font-medium">{message}</span>
            <button
                onClick={onClose}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    )
}

export default Toast
