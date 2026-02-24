"use client"

import { useState, useEffect } from "react"
import { WindowState } from "@/types/window"

// ── Clock ────────────────────────────────────────────────────────────────────

function TaskbarClock() {
    const [time, setTime] = useState("")

    useEffect(() => {
        const tick = () =>
            setTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))
        tick()
        const id = setInterval(tick, 1000)
        return () => clearInterval(id)
    }, [])

    return (
        <span className="text-xs font-medium text-blue-700 tabular-nums select-none">
            {time}
        </span>
    )
}

// ── Taskbar ──────────────────────────────────────────────────────────────────

type Props = {
    windows: WindowState[]
    onRestore: (id: string) => void
}

export function TaskBar({ windows, onRestore }: Props) {
    const minimized = windows.filter((w) => w.minimized && w.visible)

    return (
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-2 bg-white/60 backdrop-blur-md border-t border-white/40 shadow-lg z-[9999]">
            {/* Minimized window pills */}
            <div className="flex items-center gap-2">
                {minimized.length === 0 ? (
                    <span className="text-xs text-blue-400/60 select-none">No minimized windows</span>
                ) : (
                    minimized.map((w) => (
                        <button
                            key={w.id}
                            onClick={() => onRestore(w.id)}
                            className="px-3 py-1 rounded-lg bg-white/70 border border-blue-200 text-xs font-semibold text-blue-700 hover:bg-white hover:shadow transition"
                        >
                            {w.title}
                        </button>
                    ))
                )}
            </div>

            {/* Right side: clock */}
            <TaskbarClock />
        </div>
    )
}