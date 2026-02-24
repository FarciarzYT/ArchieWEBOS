"use client"

import { useEffect, useState } from "react"

const SHORTCUTS = [
    { keys: "Shift + H",       description: "Toggle this help menu" },
    { keys: "Shift + W",       description: "Open Welcome" },
    { keys: "Shift + A",       description: "Open About" },
    { keys: "Shift + T",       description: "Open Terminal" },
    { keys: "Shift + L",       description: "Open App Launcher" },
    { keys: "Shift + Space",   description: "Open PowerSearch" },
    { keys: "Double-click bar", description: "Maximize / restore window" },
    { keys: "Drag corner",     description: "Resize window" },
    { keys: "↑ / ↓ in terminal", description: "Navigate command history" },
    { keys: "↑ / ↓ in search",   description: "Navigate results" },
]

export function HelpMenu() {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.shiftKey && e.key.toLowerCase() === "h") setVisible((v) => !v)
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [])

    if (!visible) return null

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setVisible(false)} />
            <div className="relative z-10 w-full max-w-sm rounded-2xl border-[2px] border-blue-600/60 bg-white/80 backdrop-blur-xl shadow-2xl p-6">
                <h2 className="text-lg font-extrabold text-blue-700 mb-4 text-center">⌨️ Keyboard Shortcuts</h2>
                <div className="flex flex-col gap-2">
                    {SHORTCUTS.map((s) => (
                        <div key={s.keys} className="flex items-center justify-between gap-4">
                            <kbd className="px-2 py-0.5 rounded-lg bg-blue-50 border border-blue-200 text-xs font-mono text-blue-800 whitespace-nowrap">
                                {s.keys}
                            </kbd>
                            <span className="text-xs text-gray-600 text-right">{s.description}</span>
                        </div>
                    ))}
                </div>
                <button
                    onClick={() => setVisible(false)}
                    className="mt-5 w-full rounded-xl bg-blue-600 py-2 text-sm font-bold text-white hover:bg-blue-700 transition"
                >
                    Close (Shift+H)
                </button>
            </div>
        </div>
    )
}