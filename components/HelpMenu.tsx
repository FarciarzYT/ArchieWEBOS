"use client"

import { useEffect, useState } from "react"

const SHORTCUTS = [
    { keys: "Ctrl + ⇧ + H", description: "Toggle this help menu" },
    { keys: "─── Workspaces ──", description: "" },
    { keys: "Alt + 1–9,0", description: "Switch workspace 1–10" },
    { keys: "Alt + ⇧ + 1–9,0", description: "Move window to workspace" },
    { keys: "─── Open apps ───", description: "" },
    { keys: "Alt + Enter", description: "Open Terminal" },
    { keys: "Alt + D", description: "dmenu launcher" },
    { keys: "─── Tiling ──────", description: "" },
    { keys: "Alt + H/J/K/L", description: "Focus left/down/up/right" },
    { keys: "Alt + ⇧ + H/J/K/L", description: "Move window" },
    { keys: "Alt + V", description: "Next split: vertical" },
    { keys: "Alt + B", description: "Next split: horizontal" },
    { keys: "Alt + ⇧ + Space", description: "Toggle floating" },
    { keys: "Alt + F", description: "Toggle fullscreen" },
    { keys: "Ctrl + Q", description: "Close window" },
    { keys: "Alt + ⇧ + Q", description: "Close window (legacy)" },
]

export function HelpMenu() {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "h") setVisible((v) => !v)
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [])

    if (!visible) return null

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setVisible(false)} />
            <div className="relative z-10 w-full max-w-sm rounded border-[2px] border-[#4c7899] bg-[#282828] shadow-2xl p-5">
                <h2 className="text-sm font-bold text-[#b8bb26] mb-4 text-center font-mono">⌨ keybindings</h2>
                <div className="flex flex-col gap-1.5">
                    {SHORTCUTS.map((s) => (
                        <div key={s.keys} className="flex items-center justify-between gap-4">
                            <kbd className="px-2 py-0.5 bg-[#3c3836] border border-[#504945] text-[11px] font-mono text-[#ebdbb2] whitespace-nowrap">
                                {s.keys}
                            </kbd>
                            <span className="text-[11px] text-[#a89984] text-right font-mono">{s.description}</span>
                        </div>
                    ))}
                </div>
                <button
                    onClick={() => setVisible(false)}
                    className="mt-4 w-full py-1.5 text-[12px] font-bold font-mono text-[#ebdbb2] bg-[#4c7899] hover:bg-[#5a8faa] transition"
                >
                    close (Shift+ctrl+H)
                </button>
            </div>
        </div>
    )
}