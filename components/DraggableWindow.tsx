"use client"

import {
    useState,
    useRef,
    useCallback,
    useEffect,
    type MouseEvent as ReactMouseEvent,
} from "react"
import { FaCircleStop, FaRegCircleXmark, FaCircleMinus } from "react-icons/fa6"
import DraggableWindowProps from "@/types/DraggableWindowProps"

// ── Traffic-light buttons ────────────────────────────────────────────────────

type TrafficLightsProps = {
    onClose: (e: ReactMouseEvent) => void
    onMinimize: (e: ReactMouseEvent) => void
    onMaximize: (e: ReactMouseEvent) => void
}

function WindowTrafficLights({ onClose, onMinimize, onMaximize }: TrafficLightsProps) {
    return (
        <div className="flex items-center gap-1.5">
            <button
                aria-label="Close window"
                onClick={onClose}
                className="group flex items-center justify-center w-3.5 h-3.5 rounded-full bg-red-400 text-red-400 hover:text-red-900 transition-colors"
            >
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <FaRegCircleXmark />
                </span>
            </button>
            <button
                aria-label="Minimize window"
                onClick={onMinimize}
                className="group flex items-center justify-center w-3.5 h-3.5 rounded-full bg-yellow-400 text-yellow-400 hover:text-yellow-900 transition-colors"
            >
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <FaCircleMinus />
                </span>
            </button>
            <button
                aria-label="Maximize window"
                onClick={onMaximize}
                className="group flex items-center justify-center w-3.5 h-3.5 rounded-full bg-green-400 text-green-400 hover:text-green-900 transition-colors"
            >
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <FaCircleStop />
                </span>
            </button>
        </div>
    )
}

// ── Title bar ────────────────────────────────────────────────────────────────

type TitleBarProps = {
    title: string
    onDragStart: (e: ReactMouseEvent) => void
    onDoubleClick: () => void
    onClose: () => void
    onMinimize: () => void
    onMaximize: () => void
}

function WindowTitleBar({
                            title,
                            onDragStart,
                            onDoubleClick,
                            onClose,
                            onMinimize,
                            onMaximize,
                        }: TitleBarProps) {
    const stop = (fn: () => void) => (e: ReactMouseEvent) => {
        e.stopPropagation()
        fn()
    }

    return (
        <div
            onMouseDown={onDragStart}
            onDoubleClick={onDoubleClick}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600/10 cursor-grab active:cursor-grabbing shrink-0"
        >
            <WindowTrafficLights
                onClose={stop(onClose)}
                onMinimize={stop(onMinimize)}
                onMaximize={stop(onMaximize)}
            />
            <span className="flex-1 text-center text-sm font-semibold text-blue-700 truncate pointer-events-none">
                {title}
            </span>
            {/* Spacer balances the traffic lights */}
            <div className="w-13.5 shrink-0" />
        </div>
    )
}

// ── Resize handle ────────────────────────────────────────────────────────────

function WindowResizeHandle({ onResizeStart }: { onResizeStart: (e: ReactMouseEvent) => void }) {
    return (
        <div
            onMouseDown={onResizeStart}
            className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize"
            aria-hidden
        >
            <svg
                className="w-3 h-3 absolute bottom-0.5 right-0.5 text-blue-400/60"
                viewBox="0 0 6 6"
                fill="currentColor"
            >
                <circle cx="5" cy="1" r="0.6" />
                <circle cx="5" cy="3" r="0.6" />
                <circle cx="5" cy="5" r="0.6" />
                <circle cx="3" cy="3" r="0.6" />
                <circle cx="3" cy="5" r="0.6" />
                <circle cx="1" cy="5" r="0.6" />
            </svg>
        </div>
    )
}

// ── Main component ───────────────────────────────────────────────────────────

export function DraggableWindow({
                                    id,
                                    title = "Window",
                                    defaultPosition,
                                    defaultSize = { width: 400, height: 300 },
                                    minSize = { width: 220, height: 140 },
                                    visible = true,
                                    zIndex = 1,
                                    onFocus,
                                    onClose,
                                    onMinimize,
                                    resizable = true,
                                    children,
                                }: DraggableWindowProps) {

    // ── Position & size ──────────────────────────────────────────────
    const [pos, setPos] = useState({ x: 0, y: 0 })
    const [size, setSize] = useState(defaultSize)
    const initialized = useRef(false)

    useEffect(() => {
        if (initialized.current) return
        initialized.current = true
        setPos(
            defaultPosition ?? {
                x: Math.max(0, (window.innerWidth - defaultSize.width) / 2),
                y: Math.max(0, (window.innerHeight - defaultSize.height) / 2),
            }
        )
    }, [defaultPosition, defaultSize])

    // ── Maximize ─────────────────────────────────────────────────────
    const [maximized, setMaximized] = useState(false)
    const preMaxState = useRef<{ pos: typeof pos; size: typeof size } | null>(null)

    const toggleMaximize = useCallback(() => {
        if (maximized && preMaxState.current) {
            setPos(preMaxState.current.pos)
            setSize(preMaxState.current.size)
            setMaximized(false)
        } else {
            preMaxState.current = { pos, size }
            setPos({ x: 0, y: 37 })
            setSize({ width: window.innerWidth, height: window.innerHeight })
            setMaximized(true)
        }
    }, [maximized, pos, size])

    // ── Drag ─────────────────────────────────────────────────────────
    const dragging = useRef(false)
    const dragOffset = useRef({ x: 0, y: 0 })

    const handleDragStart = useCallback(
        (e: ReactMouseEvent) => {
            if (maximized) return
            e.preventDefault()
            dragging.current = true
            dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y }
            onFocus?.(id)
        },
        [pos, id, onFocus, maximized]
    )

    // ── Resize ───────────────────────────────────────────────────────
    const resizing = useRef(false)
    const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0 })

    const handleResizeStart = useCallback(
        (e: ReactMouseEvent) => {
            if (maximized) return
            e.preventDefault()
            e.stopPropagation()
            resizing.current = true
            resizeStart.current = { x: e.clientX, y: e.clientY, w: size.width, h: size.height }
            onFocus?.(id)
        },
        [size, id, onFocus, maximized]
    )

    // ── Global mouse listeners ───────────────────────────────────────
    useEffect(() => {
        const onMove = (e: globalThis.MouseEvent) => {
            if (dragging.current)
                setPos({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y })
            if (resizing.current) {
                const dx = e.clientX - resizeStart.current.x
                const dy = e.clientY - resizeStart.current.y
                setSize({
                    width: Math.max(minSize.width, resizeStart.current.w + dx),
                    height: Math.max(minSize.height, resizeStart.current.h + dy),
                })
            }
        }
        const onUp = () => { dragging.current = false; resizing.current = false }
        window.addEventListener("mousemove", onMove)
        window.addEventListener("mouseup", onUp)
        return () => {
            window.removeEventListener("mousemove", onMove)
            window.removeEventListener("mouseup", onUp)
        }
    }, [minSize])

    if (!visible) return null

    return (
        <div
            role="dialog"
            aria-label={title}
            onMouseDown={() => onFocus?.(id)}
            className="fixed select-none p-3"
            style={{ left: pos.x, top: pos.y, width: size.width, height: size.height, zIndex }}
        >
            <div className="flex flex-col h-full rounded-2xl overflow-hidden border-[2.5px] border-blue-600/80 bg-white/70 backdrop-blur-xl shadow-xl">
                <WindowTitleBar
                    title={title}
                    onDragStart={handleDragStart}
                    onDoubleClick={toggleMaximize}
                    onClose={() => onClose?.(id)}
                    onMinimize={() => onMinimize?.(id)}
                    onMaximize={toggleMaximize}
                />
                <div className="flex-1 overflow-auto p-4">
                    {children}
                </div>
                {resizable && !maximized && (
                    <WindowResizeHandle onResizeStart={handleResizeStart} />
                )}
            </div>
        </div>
    )
}