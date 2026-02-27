import { Moon, Sun } from "lucide-react"
import { useTheme } from "../../context/ThemeContext"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

const SettingsModal = ({ isOpen, onClose }) => {
    const { isDarkMode, toggleTheme } = useTheme()

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">
                        Settings
                    </DialogTitle>
                </DialogHeader>

                {/* MODAL CONTENT - Theme Selection */}
                <div className="py-2">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                        Appearance
                    </h3>

                    <div className="space-y-3">
                        {/* LIGHT MODE OPTION */}
                        <button
                            onClick={() => {
                                if (isDarkMode) toggleTheme()
                            }}
                            className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                                !isDarkMode
                                    ? "border-primary bg-primary/10"
                                    : "border-border hover:border-muted-foreground"
                            }`}
                        >
                            <div
                                className={`p-3 rounded-lg ${!isDarkMode ? "bg-orange-100 text-orange-600" : "bg-muted text-muted-foreground"}`}
                            >
                                <Sun className="w-6 h-6" />
                            </div>
                            <div className="flex-1 text-left">
                                <div className="font-semibold text-foreground">
                                    Light Mode
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Bright and clear
                                </div>
                            </div>
                            {!isDarkMode && (
                                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-background"></div>
                                </div>
                            )}
                        </button>

                        {/* DARK MODE OPTION */}
                        <button
                            onClick={() => {
                                if (!isDarkMode) toggleTheme()
                            }}
                            className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                                isDarkMode
                                    ? "border-primary bg-primary/10"
                                    : "border-border hover:border-muted-foreground"
                            }`}
                        >
                            <div
                                className={`p-3 rounded-lg ${isDarkMode ? "bg-red-900/30 text-red-400" : "bg-muted text-muted-foreground"}`}
                            >
                                <Moon className="w-6 h-6" />
                            </div>
                            <div className="flex-1 text-left">
                                <div className="font-semibold text-foreground">
                                    Dark Mode
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Easy on the eyes
                                </div>
                            </div>
                            {isDarkMode && (
                                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-background"></div>
                                </div>
                            )}
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default SettingsModal
