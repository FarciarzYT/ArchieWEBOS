"use client"

import { useState, useEffect, useRef } from "react"
import { DraggableWindow } from "@/components/DraggableWindow"
import { usePowerSearch } from "@/hooks/use-power-search"
import { WindowProps } from "@/types/window"

type Props = WindowProps & { onOpenApp: (id: string) => void; onClose: (id: string) => void }

export function PowerSearchWindow({ window: w, onFocus, onClose, onMinimize, onOpenApp }: Props) {
    const [query, setQuery]     = useState("")
    const [selected, setSelected] = useState(0)
    const inputRef = useRef<HTMLInputElement>(null)

    const results = usePowerSearch(query, onOpenApp)

    // Reset selection when results change
    useEffect(() => setSelected(0), [results.length])

    // Focus input on open
    useEffect(() => {
        if (w.visible && !w.minimized) inputRef.current?.focus()
    }, [w.visible, w.minimized])

    const runSelected = () => {
        const r = results[selected]
        if (!r || r.type === "tip") return
        r.action()
        if (r.type === "app") onClose("powersearch")
    }

    const handleKey = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown")  { e.preventDefault(); setSelected((s) => Math.min(s + 1, results.length - 1)) }
        if (e.key === "ArrowUp")    { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)) }
        if (e.key === "Enter")      runSelected()
        if (e.key === "Escape")     onClose("powersearch")
    }

    return (
        <DraggableWindow
            id="powersearch"
            title="PowerSearch"
            visible={w.visible && !w.minimized}
            zIndex={w.zIndex}
            defaultPosition={{ x: 300, y: 150 }}
            defaultSize={{ width: 560, height: 400 }}
            onFocus={onFocus}
            onClose={onClose}
            onMinimize={onMinimize}
        >
            <div className="flex flex-col h-full gap-3">
                {/* Search input */}
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl">🔍</span>
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKey}
                        placeholder="Search apps, or type a math expression..."
                        className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-blue-200 bg-blue-50/50 text-base outline-none focus:border-blue-400 focus:bg-white transition"
                    />
                </div>

                {/* Results */}
                <div className="flex-1 overflow-auto flex flex-col gap-1">
                    {query === "" ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
                            <span className="text-5xl">⚡</span>
                            <p className="text-sm font-medium">PowerSearch</p>
                            <p className="text-xs text-center">
                                Search apps by name, or type a math expression like<br />
                                <code className="font-mono bg-gray-100 px-1 rounded">12 * 8 + 4</code>
                            </p>
                        </div>
                    ) : (
                        results.map((r, i) => (
                            <button
                                key={r.id}
                                onClick={() => { r.action(); if (r.type === "app") onClose("powersearch") }}
                                onMouseEnter={() => setSelected(i)}
                                className={`
                                    flex items-center gap-3 px-4 py-3 rounded-xl text-left transition
                                    ${i === selected
                                    ? "bg-blue-500 text-white shadow-md"
                                    : "bg-white/60 hover:bg-blue-50 text-gray-700"
                                }
                                    ${r.type === "tip" ? "opacity-60 cursor-default" : "cursor-pointer"}
                                `}
                            >
                                <span className="text-2xl shrink-0">{r.icon}</span>
                                <div className="flex flex-col min-w-0">
                                    <span className="font-semibold text-sm truncate">{r.label}</span>
                                    {r.sublabel && (
                                        <span className={`text-xs truncate ${i === selected ? "text-blue-100" : "text-gray-400"}`}>
                                            {r.sublabel}
                                        </span>
                                    )}
                                </div>
                                {r.type === "calc" && (
                                    <span className={`ml-auto text-xs font-mono ${i === selected ? "text-blue-200" : "text-gray-400"}`}>
                                        calculator
                                    </span>
                                )}
                                {r.type === "app" && (
                                    <span className={`ml-auto text-xs ${i === selected ? "text-blue-200" : "text-gray-400"}`}>
                                        ↵ open
                                    </span>
                                )}
                            </button>
                        ))
                    )}
                </div>

                {/* Footer hint */}
                {query && results.length > 0 && results[0].type !== "tip" && (
                    <div className="flex gap-3 text-xs text-gray-400 pt-1 border-t border-gray-100">
                        <span><kbd className="font-mono bg-gray-100 px-1 rounded">↑↓</kbd> navigate</span>
                        <span><kbd className="font-mono bg-gray-100 px-1 rounded">↵</kbd> open</span>
                        <span><kbd className="font-mono bg-gray-100 px-1 rounded">Esc</kbd> close</span>
                    </div>
                )}
            </div>
        </DraggableWindow>
    )
}