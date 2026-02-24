"use client"

import { useState } from "react"
import { DraggableWindow } from "@/components/DraggableWindow"
import { WindowProps } from "@/types/window"


export function YoutubeWindow({ window: w, onFocus, onClose, onMinimize }: WindowProps) {
    const [query,    setQuery]    = useState("")
    const [videoId,  setVideoId]  = useState<string | null>(null)
    const [inputVal, setInputVal] = useState("")

    const extractId = (raw: string): string | null => {
        raw = raw.trim()
        // Full URL patterns
        try {
            const url = new URL(raw)
            if (url.hostname.includes("youtube.com")) return url.searchParams.get("v")
            if (url.hostname === "youtu.be")          return url.pathname.slice(1)
        } catch {}
        // Plain 11-char video ID
        if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) return raw
        return null
    }

    const submit = () => {
        const id = extractId(inputVal)
        if (id) {
            setVideoId(id)
            setQuery("")
        } else {
            // Treat as search query
            setVideoId(null)
            setQuery(inputVal.trim())
        }
    }

    const handleKey = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") submit()
    }

    const searchUrl = query
        ? `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(query)}&autoplay=1`
        : null

    const embedUrl = videoId
        ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`
        : null

    const src = embedUrl ?? searchUrl

    return (
        <DraggableWindow
            id="youtube"
            title="YouTube"
            visible={w.visible && !w.minimized}
            zIndex={w.zIndex}
            defaultPosition={{ x: 120, y: 60 }}
            defaultSize={{ width: 700, height: 520 }}
            onFocus={onFocus}
            onClose={onClose}
            onMinimize={onMinimize}
        >
            <div className="flex flex-col h-full gap-2">
                {/* Search / URL bar */}
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">▶️</span>
                        <input
                            value={inputVal}
                            onChange={(e) => setInputVal(e.target.value)}
                            onKeyDown={handleKey}
                            placeholder="Paste YouTube URL, video ID, or search..."
                            className="w-full pl-9 pr-3 py-2 rounded-xl border-2 border-red-200 bg-red-50/40 text-sm outline-none focus:border-red-400 focus:bg-white transition"
                        />
                    </div>
                    <button
                        onClick={submit}
                        className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition shrink-0"
                    >
                        Go
                    </button>
                </div>

                {/* Quick suggestions */}


                {/* Player */}
                {src ? (
                    <div className="flex-1 rounded-xl overflow-hidden border-2 border-red-100 bg-black">
                        <iframe
                            key={src}
                            src={src}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title="YouTube player"
                        />
                    </div>
                ) : (
                    <div className="flex-1 rounded-xl border-2 border-dashed border-red-200 flex flex-col items-center justify-center gap-3 text-gray-400 bg-red-50/30">
                        <span className="text-6xl">▶️</span>
                        <p className="text-sm font-medium">Enter a YouTube URL or search above</p>
                        <p className="text-xs">Supports youtube.com/watch?v=... and youtu.be/... links</p>
                    </div>
                )}
            </div>
        </DraggableWindow>
    )
}