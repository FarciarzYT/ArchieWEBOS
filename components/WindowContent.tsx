"use client"

/**
 * WindowContent — the inner chrome (titlebar + content) used by both
 * DraggableWindow (floating) and TilingLayout (tiled).
 *
 * In tiling mode: i3-style minimal titlebar (title + close button)
 * In floating mode: macOS-style traffic lights + drag handle
 */

import { type MouseEvent as ReactMouseEvent } from "react"
import { FaCircleStop, FaRegCircleXmark, FaCircleMinus } from "react-icons/fa6"

// ── Traffic lights (floating mode only) ──────────────────────────────────────

type LightsProps = {
    onClose: (e: ReactMouseEvent) => void
    onMinimize: (e: ReactMouseEvent) => void
    onMaximize: (e: ReactMouseEvent) => void
}

export function WindowTrafficLights({ onClose, onMinimize, onMaximize }: LightsProps) {
    return (
        <div className="flex items-center gap-1.5">
            <button aria-label="Close" onClick={onClose} className="group flex items-center justify-center w-3.5 h-3.5 rounded-full bg-red-400    text-red-400    hover:text-red-900    transition-colors"><span className="opacity-0 group-hover:opacity-100 transition-opacity"><FaRegCircleXmark /></span></button>
            <button aria-label="Minimize" onClick={onMinimize} className="group flex items-center justify-center w-3.5 h-3.5 rounded-full bg-yellow-400 text-yellow-400 hover:text-yellow-900 transition-colors"><span className="opacity-0 group-hover:opacity-100 transition-opacity"><FaCircleMinus /></span></button>
            <button aria-label="Maximize" onClick={onMaximize} className="group flex items-center justify-center w-3.5 h-3.5 rounded-full bg-green-400  text-green-400  hover:text-green-900  transition-colors"><span className="opacity-0 group-hover:opacity-100 transition-opacity"><FaCircleStop /></span></button>
        </div>
    )
}

// ── i3 tiled title bar ───────────────────────────────────────────────────────

type I3TitleBarProps = {
    title: string
    isFocused: boolean
    onClose: () => void
    onMinimize: () => void
}

export function I3TitleBar({ title, isFocused, onClose, onMinimize }: I3TitleBarProps) {
    return (
        <div className={`
            flex items-center justify-between px-2 py-0.5 shrink-0 font-mono text-[11px]
            ${isFocused ? "bg-[#285577] text-[#ffffff]" : "bg-[#333333] text-[#888888]"}
        `}>
            <span className="truncate flex-1">{title}</span>
            <div className="flex items-center gap-1 ml-2">
                <button
                    onClick={(e) => { e.stopPropagation(); onMinimize() }}
                    className="px-1 hover:bg-[#555555] transition-colors rounded text-[10px]"
                    aria-label="Minimize"
                >
                    _
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onClose() }}
                    className="px-1 hover:bg-red-600 hover:text-white transition-colors rounded text-[10px]"
                    aria-label="Close"
                >
                    ✕
                </button>
            </div>
        </div>
    )
}

// ── Title bar (floating mode) ────────────────────────────────────────────────

type TitleBarProps = {
    title: string
    isTiled?: boolean
    onDragStart?: (e: ReactMouseEvent) => void
    onDoubleClick?: () => void
    onClose: () => void
    onMinimize: () => void
    onMaximize: () => void
}

export function WindowTitleBar({
    title,
    isTiled = false,
    onDragStart,
    onDoubleClick,
    onClose,
    onMinimize,
    onMaximize,
}: TitleBarProps) {
    const stop = (fn: () => void) => (e: ReactMouseEvent) => { e.stopPropagation(); fn() }

    // In tiled mode we use the i3 title bar instead
    if (isTiled) return null

    return (
        <div
            onMouseDown={onDragStart}
            onDoubleClick={onDoubleClick}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600/10 shrink-0 cursor-grab active:cursor-grabbing"
        >
            <WindowTrafficLights
                onClose={stop(onClose)}
                onMinimize={stop(onMinimize)}
                onMaximize={stop(onMaximize)}
            />
            <span className="flex-1 text-center text-sm font-semibold text-blue-700 truncate pointer-events-none">
                {title}
            </span>
            <div className="w-12 shrink-0" />
        </div>
    )
}