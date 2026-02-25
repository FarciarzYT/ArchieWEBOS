"use client"

import {
    useState, useRef, useCallback, useEffect,
    type MouseEvent as ReactMouseEvent,
} from "react"
import { WindowTitleBar } from "@/components/WindowContent"
import DraggableWindowProps from "@/types/DraggableWindowProps"
import { TASKBAR_H, STATUS_BAR_H } from "@/hooks/use-tiling-manager"

function ResizeHandle({ onResizeStart }: { onResizeStart: (e: ReactMouseEvent) => void }) {
    return (
        <div onMouseDown={onResizeStart} className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize" aria-hidden>
            <svg className="w-3 h-3 absolute bottom-0.5 right-0.5 text-blue-400/60" viewBox="0 0 6 6" fill="currentColor">
                <circle cx="5" cy="1" r="0.6" /><circle cx="5" cy="3" r="0.6" /><circle cx="5" cy="5" r="0.6" />
                <circle cx="3" cy="3" r="0.6" /><circle cx="3" cy="5" r="0.6" /><circle cx="1" cy="5" r="0.6" />
            </svg>
        </div>
    )
}

export function DraggableWindow({
    id, title = "Window",
    defaultPosition, defaultSize = { width: 400, height: 300 },
    minSize = { width: 220, height: 140 },
    visible = true, zIndex = 1,
    onFocus, onClose, onMinimize,
    resizable = true, children,
}: DraggableWindowProps) {

    const [pos, setPos] = useState({ x: 0, y: 0 })
    const [size, setSize] = useState(defaultSize)
    const initialized = useRef(false)

    const posRef = useRef(pos)
    posRef.current = pos
    const sizeRef = useRef(size)
    sizeRef.current = size

    useEffect(() => {
        if (initialized.current) return
        initialized.current = true
        setPos(defaultPosition ?? {
            x: Math.max(0, (window.innerWidth - defaultSize.width) / 2),
            y: Math.max(STATUS_BAR_H, (window.innerHeight - STATUS_BAR_H - TASKBAR_H - defaultSize.height) / 2 + STATUS_BAR_H),
        })
    }, [defaultPosition, defaultSize])

    const [maximized, setMaximized] = useState(false)
    const preMaxState = useRef<{ pos: typeof pos; size: typeof size } | null>(null)

    const toggleMaximize = useCallback(() => {
        if (maximized && preMaxState.current) {
            setPos(preMaxState.current.pos); setSize(preMaxState.current.size); setMaximized(false)
        } else {
            preMaxState.current = { pos, size }
            setPos({ x: 0, y: STATUS_BAR_H }); setSize({ width: window.innerWidth, height: window.innerHeight - STATUS_BAR_H - TASKBAR_H }); setMaximized(true)
        }
    }, [maximized, pos, size])

    const dragging = useRef(false)
    const dragOffset = useRef({ x: 0, y: 0 })

    const handleDragStart = useCallback((e: ReactMouseEvent) => {
        if (maximized) return
        e.preventDefault(); dragging.current = true
        dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y }
        onFocus?.(id)
    }, [pos, id, onFocus, maximized])

    const resizing = useRef(false)
    const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0 })

    const handleResizeStart = useCallback((e: ReactMouseEvent) => {
        if (maximized) return
        e.preventDefault(); e.stopPropagation(); resizing.current = true
        resizeStart.current = { x: e.clientX, y: e.clientY, w: size.width, h: size.height }
        onFocus?.(id)
    }, [size, id, onFocus, maximized])

    useEffect(() => {
        const onMove = (e: globalThis.MouseEvent) => {
            if (dragging.current) {
                let newX = e.clientX - dragOffset.current.x
                let newY = e.clientY - dragOffset.current.y
                newX = Math.max(0, Math.min(newX, window.innerWidth - sizeRef.current.width))
                newY = Math.max(STATUS_BAR_H, Math.min(newY, window.innerHeight - TASKBAR_H - sizeRef.current.height))
                setPos({ x: newX, y: newY })
            }
            if (resizing.current) {
                let newW = Math.max(minSize.width, resizeStart.current.w + e.clientX - resizeStart.current.x)
                let newH = Math.max(minSize.height, resizeStart.current.h + e.clientY - resizeStart.current.y)
                newW = Math.min(newW, window.innerWidth - posRef.current.x)
                newH = Math.min(newH, window.innerHeight - TASKBAR_H - posRef.current.y)
                setSize({
                    width: newW,
                    height: newH,
                })
            }
        }
        const onUp = () => { dragging.current = false; resizing.current = false }
        window.addEventListener("mousemove", onMove)
        window.addEventListener("mouseup", onUp)
        return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp) }
    }, [minSize])

    if (!visible) return null

    return (
        <div
            role="dialog" aria-label={title}
            onMouseDown={() => onFocus?.(id)}
            className="fixed select-none"
            style={{ left: pos.x, top: pos.y, width: size.width, height: size.height, zIndex }}
        >
            <div className="flex flex-col h-full mt-7 rounded-2xl border-[2.5px] border-blue-600/80 bg-black/70 backdrop-blur-xl shadow-xl">
                <WindowTitleBar
                    title={title}
                    onDragStart={handleDragStart}
                    onDoubleClick={toggleMaximize}
                    onClose={() => onClose?.(id)}
                    onMinimize={() => onMinimize?.(id)}
                    onMaximize={toggleMaximize}
                />
                <div className="flex-1 overflow-auto p-4">{children}</div>
                {resizable && !maximized && <ResizeHandle onResizeStart={handleResizeStart} />}
            </div>
        </div>
    )
}