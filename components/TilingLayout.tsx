"use client"

import { useRef } from "react"
import { computeRects } from "@/hooks/use-tiling-manager"
import { TilingLayout as TilingLayoutType, LayoutNode, SplitNode, Rect } from "@/types/tiling"
import { WindowState } from "@/types/window"

type TileProps = {
    windowId: string
    rect: { x: number; y: number; width: number; height: number }
    isFocused: boolean
    isFullscreen: boolean
    onFocus: (id: string) => void
    children: React.ReactNode
}

function TileFrame({ windowId, rect, isFocused, isFullscreen, onFocus, children }: TileProps) {
    const GAP = 2  // i3-style minimal gaps

    const style = isFullscreen
        ? { position: "fixed" as const, inset: 0, zIndex: 9000 }
        : {
            position: "fixed" as const,
            left: rect.x + GAP,
            top: rect.y + GAP,
            width: rect.width - GAP * 2,
            height: rect.height - GAP * 2,
            zIndex: isFocused ? 100 : 10,
        }

    return (
        <div
            style={style}
            onMouseDown={() => onFocus(windowId)}
            className={`
                flex flex-col overflow-hidden
                border-[2px] transition-colors duration-75
                ${isFocused
                    ? "border-[#4c7899]"
                    : "border-[#333333]"
                }
                bg-[#1d2021]
            `}
        >
            {children}
        </div>
    )
}

// ── Resize handle between two panes ──────────────────────────────────────────

type ResizeHandleProps = {
    direction: "horizontal" | "vertical"
    position: { x: number; y: number; width: number; height: number }
    onResize: (delta: number) => void
}

function ResizeHandle({ direction, position, onResize }: ResizeHandleProps) {
    const dragging = useRef(false)
    const startPos = useRef(0)

    const onMouseDown = (e: React.MouseEvent) => {
        e.preventDefault()
        dragging.current = true
        startPos.current = direction === "horizontal" ? e.clientX : e.clientY

        const onMove = (e: MouseEvent) => {
            if (!dragging.current) return
            const pos = direction === "horizontal" ? e.clientX : e.clientY
            const delta = (pos - startPos.current) / (direction === "horizontal" ? window.innerWidth : window.innerHeight)
            onResize(delta)
            startPos.current = pos
        }
        const onUp = () => { dragging.current = false; window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp) }
        window.addEventListener("mousemove", onMove)
        window.addEventListener("mouseup", onUp)
    }

    return (
        <div
            style={{
                position: "fixed",
                left: position.x,
                top: position.y,
                width: position.width,
                height: position.height,
                zIndex: 200,
            }}
            onMouseDown={onMouseDown}
            className={`
                ${direction === "horizontal" ? "cursor-col-resize" : "cursor-row-resize"}
                bg-transparent hover:bg-[#4c7899]/40 transition-colors
            `}
        />
    )
}

// ── Collect resize handle positions from the layout tree ──────────────────────

function collectResizeHandles(
    node: LayoutNode,
    rect: Rect,
    handles: { direction: "horizontal" | "vertical"; position: Rect }[]
) {
    if (node.type === "leaf") return

    let offset = 0
    const HANDLE_SIZE = 6  // px

    node.children.forEach((child, i) => {
        const ratio = node.ratios[i]
        const childSize = node.direction === "horizontal" ? rect.width * ratio : rect.height * ratio

        // Add handle between children (not after last)
        if (i < node.children.length - 1) {
            const handlePos: Rect = node.direction === "horizontal"
                ? {
                    x: rect.x + offset + childSize - HANDLE_SIZE / 2,
                    y: rect.y,
                    width: HANDLE_SIZE,
                    height: rect.height,
                }
                : {
                    x: rect.x,
                    y: rect.y + offset + childSize - HANDLE_SIZE / 2,
                    width: rect.width,
                    height: HANDLE_SIZE,
                }
            handles.push({ direction: node.direction, position: handlePos })
        }

        // Recurse
        const childRect: Rect = node.direction === "horizontal"
            ? { x: rect.x + offset, y: rect.y, width: childSize, height: rect.height }
            : { x: rect.x, y: rect.y + offset, width: rect.width, height: childSize }
        collectResizeHandles(child, childRect, handles)

        offset += childSize
    })
}

// ── Main TilingLayout component ───────────────────────────────────────────────

type Props = {
    layout: TilingLayoutType
    windows: WindowState[]
    screenW: number
    screenH: number
    taskbarH: number
    statusBarH: number
    onFocus: (id: string) => void
    onResize: (delta: number) => void
    renderWindow: (id: string) => React.ReactNode
}

export function TilingLayout({
    layout,
    windows,
    screenW,
    screenH,
    taskbarH,
    statusBarH,
    onFocus,
    onResize,
    renderWindow,
}: Props) {
    if (!layout.root) return null

    const availH = screenH - taskbarH - statusBarH
    const rootRect = { x: 0, y: statusBarH, width: screenW, height: availH }
    const rects = computeRects(layout.root, rootRect)

    // Collect tiled window IDs
    const tiledIds = Array.from(rects.keys()).filter((id) => {
        const win = windows.find((w) => w.id === id)
        return win?.visible && !win.minimized
    })

    // Collect resize handles
    const handles: { direction: "horizontal" | "vertical"; position: Rect }[] = []
    collectResizeHandles(layout.root, rootRect, handles)

    return (
        <>
            {tiledIds.map((id) => {
                const rect = rects.get(id)!
                const isFocused = layout.focused === id
                const isFullscreen = layout.fullscreen === id

                return (
                    <TileFrame
                        key={id}
                        windowId={id}
                        rect={rect}
                        isFocused={isFocused}
                        isFullscreen={isFullscreen}
                        onFocus={onFocus}
                    >
                        {renderWindow(id)}
                    </TileFrame>
                )
            })}

            {/* Resize handles */}
            {handles.map((h, i) => (
                <ResizeHandle
                    key={`handle-${i}`}
                    direction={h.direction}
                    position={h.position}
                    onResize={onResize}
                />
            ))}
        </>
    )
}