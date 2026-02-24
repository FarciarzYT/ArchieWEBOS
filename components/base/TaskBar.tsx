"use client"

import { WindowState } from "@/types/window"

// ── i3-style bottom bar (minimal, just for minimized windows) ────────────────

type Props = {
    windows: WindowState[]
    onRestore: (id: string) => void
    onOpenApp: (id: string) => void
}

export function TaskBar({ windows, onRestore }: Props) {
    const minimized = windows.filter((w) => w.minimized && w.visible)

    // In i3 mode, we only show a thin bottom bar if there are minimized windows
    if (minimized.length === 0) return null

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[9998] flex items-center gap-1 px-2 py-1 bg-[#282828] border-t border-[#3c3836] font-mono text-[11px]">
            <span className="text-[#665c54] mr-1">minimized:</span>
            {minimized.map((w) => (
                <button
                    key={w.id}
                    onClick={() => onRestore(w.id)}
                    className="px-2 py-0.5 bg-[#3c3836] text-[#a89984] hover:bg-[#504945] hover:text-[#ebdbb2] transition-colors"
                >
                    {w.title}
                </button>
            ))}
        </div>
    )
}