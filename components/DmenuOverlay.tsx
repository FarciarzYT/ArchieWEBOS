"use client"

import { useState, useEffect, useRef } from "react"
import { APPS } from "@/data/apps"

type Props = {
    visible: boolean
    onClose: () => void
    onLaunch: (appId: string) => void
}

export function DmenuOverlay({ visible, onClose, onLaunch }: Props) {
    const [query, setQuery] = useState("")
    const [selectedIndex, setSelectedIndex] = useState(0)
    const inputRef = useRef<HTMLInputElement>(null)

    const filtered = APPS.filter(app =>
        app.label.toLowerCase().includes(query.toLowerCase()) ||
        app.id.toLowerCase().includes(query.toLowerCase())
    )

    useEffect(() => {
        if (visible) {
            setQuery("")
            setSelectedIndex(0)
            // Focus input after a frame
            requestAnimationFrame(() => inputRef.current?.focus())
        }
    }, [visible])

    useEffect(() => {
        if (!visible) return
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.preventDefault()
                onClose()
            }
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [visible, onClose])

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown" || (e.key === "Tab" && !e.shiftKey)) {
            e.preventDefault()
            setSelectedIndex(i => Math.min(i + 1, filtered.length - 1))
        } else if (e.key === "ArrowUp" || (e.key === "Tab" && e.shiftKey)) {
            e.preventDefault()
            setSelectedIndex(i => Math.max(i - 1, 0))
        } else if (e.key === "Enter") {
            e.preventDefault()
            if (filtered[selectedIndex]) {
                onLaunch(filtered[selectedIndex].id)
                onClose()
            }
        }
    }

    if (!visible) return null

    return (
        <div className="fixed inset-0 z-[99999]" onClick={onClose}>
            {/* Dim backdrop */}
            <div className="absolute inset-0 bg-black/40" />

            {/* dmenu bar at top */}
            <div
                className="absolute top-7 left-0 right-0 bg-[#1d2021] border-b border-[#3c3836] shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center">
                    {/* Prompt */}
                    <span className="px-3 py-1.5 text-[#b8bb26] font-mono text-[13px] font-bold bg-[#282828] border-r border-[#3c3836]">
                        run:
                    </span>

                    {/* Input */}
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={e => { setQuery(e.target.value); setSelectedIndex(0) }}
                        onKeyDown={handleKeyDown}
                        className="flex-1 px-3 py-1.5 bg-transparent text-[#ebdbb2] font-mono text-[13px] outline-none placeholder-[#665c54]"
                        placeholder="type to search..."
                        autoComplete="off"
                        spellCheck={false}
                    />

                    {/* Filtered results inline */}
                    <div className="flex items-center overflow-hidden">
                        {filtered.slice(0, 8).map((app, i) => (
                            <button
                                key={app.id}
                                onClick={() => { onLaunch(app.id); onClose() }}
                                className={`
                                    px-3 py-1.5 font-mono text-[12px] whitespace-nowrap transition-colors
                                    ${i === selectedIndex
                                        ? "bg-[#458588] text-white"
                                        : "text-[#a89984] hover:bg-[#3c3836] hover:text-[#ebdbb2]"
                                    }
                                `}
                            >
                                {app.icon} {app.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
