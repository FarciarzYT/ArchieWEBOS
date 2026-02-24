"use client"

import { useState, useRef, useCallback } from "react"
import { DraggableWindow } from "@/components/DraggableWindow"
import { WindowProps } from "@/types/window"

const HOME_URL = "https://hackclub.com"

const BOOKMARKS = [
    { label: "WebSecurityLearningLabs",url: "https://web-security-learning-labs.vercel.app/" },
    { label: "HackClub",url: "https://hackclub.com",   icon: "🟠" },
    { label: "Wikipedia",  url: "https://www.wikipedia.org",      icon: "📖" },
    { label: "Archive.org",url: "https://archive.org",            icon: "🏛️" },
]

// Sites known to block iframes
const BLOCKED_HOSTS = [
    "google.com", "youtube.com", "twitter.com", "x.com",
    "facebook.com", "instagram.com", "reddit.com", "netflix.com",
]

function isLikelyBlocked(url: string): boolean {
    try {
        const host = new URL(url).hostname.replace("www.", "")
        return BLOCKED_HOSTS.some((b) => host.endsWith(b))
    } catch { return false }
}

function normalizeUrl(raw: string): string {
    raw = raw.trim()
    if (!raw) return HOME_URL
    // If it looks like a search query, go to DuckDuckGo
    if (!raw.includes(".") || raw.includes(" "))
        return `https://duckduckgo.com/?q=${encodeURIComponent(raw)}&ia=web`
    if (!/^https?:\/\//i.test(raw)) return "https://" + raw
    return raw
}

export function BrowserWindow({ window: w, onFocus, onClose, onMinimize }: WindowProps) {
    const [url,         setUrl]         = useState(HOME_URL)
    const [inputVal,    setInputVal]    = useState(HOME_URL)
    const [loading,     setLoading]     = useState(false)
    const [blocked,     setBlocked]     = useState(false)
    const [history,     setHistory]     = useState<string[]>([HOME_URL])
    const [histIdx,     setHistIdx]     = useState(0)
    const [showBookmarks, setShowBookmarks] = useState(false)
    const iframeRef = useRef<HTMLIFrameElement>(null)

    const navigate = useCallback((raw: string) => {
        const next = normalizeUrl(raw)
        setUrl(next)
        setInputVal(next)
        setLoading(true)
        setBlocked(isLikelyBlocked(next))
        setShowBookmarks(false)
        setHistory((h) => {
            const trimmed = h.slice(0, histIdx + 1)
            return [...trimmed, next]
        })
        setHistIdx((i) => i + 1)
    }, [histIdx])

    const goBack = () => {
        if (histIdx <= 0) return
        const prev = history[histIdx - 1]
        setHistIdx((i) => i - 1)
        setUrl(prev)
        setInputVal(prev)
        setBlocked(isLikelyBlocked(prev))
        setLoading(true)
    }

    const goForward = () => {
        if (histIdx >= history.length - 1) return
        const next = history[histIdx + 1]
        setHistIdx((i) => i + 1)
        setUrl(next)
        setInputVal(next)
        setBlocked(isLikelyBlocked(next))
        setLoading(true)
    }

    const reload = () => {
        setLoading(true)
        setBlocked(isLikelyBlocked(url))
        // Force iframe reload by briefly clearing src
        if (iframeRef.current) {
            iframeRef.current.src = ""
            setTimeout(() => { if (iframeRef.current) iframeRef.current.src = url }, 50)
        }
    }

    const isSecure = url.startsWith("https://")

    return (
        <DraggableWindow
            id="browser"
            title="Browser"
            visible={w.visible && !w.minimized}
            zIndex={w.zIndex}
            defaultPosition={{ x: 80, y: 50 }}
            defaultSize={{ width: 900, height: 620 }}
            onFocus={onFocus}
            onClose={onClose}
            onMinimize={onMinimize}
        >
            <div className="flex flex-col h-full gap-1.5">

                {/* ── Navigation bar ───────────────────────────────── */}
                <div className="flex items-center gap-1.5">
                    {/* Back / Forward / Reload */}
                    <div className="flex gap-0.5">
                        <button
                            onClick={goBack}
                            disabled={histIdx <= 0}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-30 transition"
                            title="Back"
                        >←</button>
                        <button
                            onClick={goForward}
                            disabled={histIdx >= history.length - 1}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-30 transition"
                            title="Forward"
                        >→</button>
                        <button
                            onClick={reload}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm bg-gray-100 hover:bg-gray-200 transition"
                            title="Reload"
                        >↺</button>
                        <button
                            onClick={() => navigate(HOME_URL)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm bg-gray-100 hover:bg-gray-200 transition"
                            title="Home"
                        >⌂</button>
                    </div>

                    {/* Address bar */}
                    <div className="relative flex-1">
                        {/* Lock icon */}
                        <span
                            className={`absolute left-2.5 top-1/2 -translate-y-1/2 text-xs select-none ${isSecure ? "text-green-500" : "text-gray-400"}`}
                            title={isSecure ? "Secure connection" : "Not secure"}
                        >
                            {isSecure ? "🔒" : "🔓"}
                        </span>

                        <input
                            value={inputVal}
                            onChange={(e) => setInputVal(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") navigate(inputVal)
                                if (e.key === "Escape") setInputVal(url)
                            }}
                            onFocus={(e) => e.target.select()}
                            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-xs outline-none focus:border-blue-400 focus:bg-white transition font-mono"
                            spellCheck={false}
                        />

                        {/* Loading spinner */}
                        {loading && (
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs animate-spin">⟳</span>
                        )}
                    </div>

                    {/* Bookmarks toggle */}
                    <button
                        onClick={() => setShowBookmarks((v) => !v)}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm transition ${showBookmarks ? "bg-blue-100 text-blue-600" : "bg-gray-100 hover:bg-gray-200"}`}
                        title="Bookmarks"
                    >⭐</button>

                    {/* Open in real browser */}
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-sm bg-gray-100 hover:bg-gray-200 transition"
                        title="Open in real browser"
                    >↗</a>
                </div>

                {/* ── Bookmarks bar ─────────────────────────────────── */}
                {showBookmarks && (
                    <div className="flex flex-wrap gap-1.5 px-1 py-1.5 rounded-xl bg-amber-50 border border-amber-100">
                        {BOOKMARKS.map((b) => (
                            <button
                                key={b.url}
                                onClick={() => navigate(b.url)}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-amber-200 hover:border-amber-400 hover:shadow-sm text-xs font-medium text-gray-700 transition"
                            >
                                <span>{b.icon}</span>
                                {b.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* ── Viewport ──────────────────────────────────────── */}
                <div className="flex-1 rounded-xl overflow-hidden border border-gray-200 relative bg-white">
                    {/* Blocked site warning */}
                    {blocked ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gray-50 text-center px-8">
                            <span className="text-5xl">🚫</span>
                            <h3 className="text-base font-bold text-gray-700">This site blocks embedding</h3>
                            <p className="text-xs text-gray-500 max-w-xs">
                                <strong>{new URL(url).hostname}</strong> sends headers that prevent it from
                                being shown inside another page. This is a browser security policy, not a bug.
                            </p>
                            <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold transition"
                            >
                                Open in real browser ↗
                            </a>
                        </div>
                    ) : (
                        <iframe
                            ref={iframeRef}
                            key={url}
                            src={url}
                            className="w-full h-full border-none"
                            onLoad={() => setLoading(false)}
                            onError={() => { setLoading(false); setBlocked(true) }}
                            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                            title="Browser"
                        />
                    )}
                </div>

                {/* ── Status bar ────────────────────────────────────── */}
                <div className="flex items-center justify-between px-1 text-[10px] text-gray-400 select-none">
                    <span className="truncate max-w-xs font-mono">{url}</span>
                    <span>{history.length} page{history.length !== 1 ? "s" : ""} in history</span>
                </div>
            </div>
        </DraggableWindow>
    )
}