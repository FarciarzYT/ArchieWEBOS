"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { DraggableWindow } from "@/components/DraggableWindow"
import { WindowProps } from "@/types/window"

type Tool = "pencil" | "eraser" | "rectangle" | "circle" | "fill" | "line"

const PALETTE = [
    "#000000","#ffffff","#ef4444","#f97316","#eab308",
    "#22c55e","#3b82f6","#8b5cf6","#ec4899","#06b6d4",
    "#6b7280","#92400e","#1d4ed8","#047857","#7c3aed",
    "#be123c",
]

function floodFill(
    ctx: CanvasRenderingContext2D,
    x: number, y: number,
    fillColor: string
) {
    const w = ctx.canvas.width
    const h = ctx.canvas.height
    const imgData = ctx.getImageData(0, 0, w, h)
    const data = imgData.data
    const idx = (x + y * w) * 4
    const [tr, tg, tb, ta] = [data[idx], data[idx+1], data[idx+2], data[idx+3]]

    const fc = document.createElement("canvas")
    fc.width = 1; fc.height = 1
    const fctx = fc.getContext("2d")!
    fctx.fillStyle = fillColor
    fctx.fillRect(0, 0, 1, 1)
    const [fr, fg, fb] = Array.from(fctx.getImageData(0, 0, 1, 1).data)

    if (fr === tr && fg === tg && fb === tb) return

    const match = (i: number) =>
        data[i] === tr && data[i+1] === tg && data[i+2] === tb && data[i+3] === ta

    const paint = (i: number) => {
        data[i] = fr; data[i+1] = fg; data[i+2] = fb; data[i+3] = 255
    }

    const stack = [idx / 4]
    while (stack.length) {
        const p = stack.pop()!
        const px = p % w, py = Math.floor(p / w)
        if (px < 0 || px >= w || py < 0 || py >= h) continue
        const i = p * 4
        if (!match(i)) continue
        paint(i)
        stack.push(p - 1, p + 1, p - w, p + w)
    }
    ctx.putImageData(imgData, 0, 0)
}

export function PaintWindow({ window: w, onFocus, onClose, onMinimize }: WindowProps) {
    const canvasRef    = useRef<HTMLCanvasElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [tool,      setTool]      = useState<Tool>("pencil")
    const [color,     setColor]     = useState("#000000")
    const [brushSize, setBrushSize] = useState(4)
    const [drawing,   setDrawing]   = useState(false)
    const [startPos,  setStartPos]  = useState({ x: 0, y: 0 })
    const snapshotRef = useRef<ImageData | null>(null)

    // Resize canvas pixel buffer to match its CSS container size
    useEffect(() => {
        if (!w.visible || w.minimized) return
        const canvas    = canvasRef.current
        const container = containerRef.current
        if (!canvas || !container) return

        const init = (saveContent: boolean) => {
            const { width, height } = container.getBoundingClientRect()
            if (width === 0 || height === 0) return

            // Save current drawing before resizing
            let snapshot: ImageData | null = null
            const ctx = canvas.getContext("2d")!
            if (saveContent && canvas.width > 0 && canvas.height > 0)
                snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height)

            canvas.width  = Math.round(width)
            canvas.height = Math.round(height)

            // White background first
            ctx.fillStyle = "#ffffff"
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            // Restore saved drawing
            if (snapshot) ctx.putImageData(snapshot, 0, 0)
        }

        // Initial fill
        init(false)

        // Watch for container resize (e.g. window resize/drag)
        const ro = new ResizeObserver(() => init(true))
        ro.observe(container)
        return () => ro.disconnect()
    }, [w.visible, w.minimized])

    const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current!
        const r      = canvas.getBoundingClientRect()
        // Scale mouse coords from CSS pixels → canvas pixels
        const scaleX = canvas.width  / r.width
        const scaleY = canvas.height / r.height
        return {
            x: Math.round((e.clientX - r.left) * scaleX),
            y: Math.round((e.clientY - r.top)  * scaleY),
        }
    }

    const onMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        const pos = getPos(e)
        const ctx = canvasRef.current!.getContext("2d")!

        if (tool === "fill") {
            floodFill(ctx, pos.x, pos.y, color)
            return
        }

        snapshotRef.current = ctx.getImageData(0, 0, canvasRef.current!.width, canvasRef.current!.height)
        setStartPos(pos)
        setDrawing(true)

        if (tool === "pencil" || tool === "eraser" || tool === "line") {
            ctx.beginPath()
            ctx.moveTo(pos.x, pos.y)
        }
    }, [tool, color])

    const onMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!drawing) return
        const pos = getPos(e)
        const ctx = canvasRef.current!.getContext("2d")!

        ctx.lineWidth   = brushSize
        ctx.lineCap     = "round"
        ctx.lineJoin    = "round"
        ctx.strokeStyle = tool === "eraser" ? "#ffffff" : color

        if (tool === "pencil" || tool === "eraser") {
            ctx.lineTo(pos.x, pos.y)
            ctx.stroke()
        } else if (tool === "line") {
            ctx.putImageData(snapshotRef.current!, 0, 0)
            ctx.beginPath()
            ctx.moveTo(startPos.x, startPos.y)
            ctx.lineTo(pos.x, pos.y)
            ctx.stroke()
        } else if (tool === "rectangle") {
            ctx.putImageData(snapshotRef.current!, 0, 0)
            ctx.strokeRect(startPos.x, startPos.y, pos.x - startPos.x, pos.y - startPos.y)
        } else if (tool === "circle") {
            ctx.putImageData(snapshotRef.current!, 0, 0)
            const rx = (pos.x - startPos.x) / 2
            const ry = (pos.y - startPos.y) / 2
            ctx.beginPath()
            ctx.ellipse(startPos.x + rx, startPos.y + ry, Math.abs(rx), Math.abs(ry), 0, 0, Math.PI * 2)
            ctx.stroke()
        }
    }, [drawing, tool, color, brushSize, startPos])

    const onMouseUp = useCallback(() => setDrawing(false), [])

    const save = () => {
        const a = document.createElement("a")
        a.href     = canvasRef.current!.toDataURL("image/png")
        a.download = "painting.png"
        a.click()
    }

    const clear = () => {
        const canvas = canvasRef.current!
        const ctx = canvas.getContext("2d")!
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    const TOOLS: { id: Tool; icon: string; label: string }[] = [
        { id: "pencil",    icon: "✏️",  label: "Pencil" },
        { id: "eraser",    icon: "🧹",  label: "Eraser" },
        { id: "line",      icon: "╱",   label: "Line" },
        { id: "rectangle", icon: "▭",   label: "Rectangle" },
        { id: "circle",    icon: "◯",   label: "Circle" },
        { id: "fill",      icon: "🪣",  label: "Fill" },
    ]

    return (
        <DraggableWindow
            id="paint"
            title="Paint"
            visible={w.visible && !w.minimized}
            zIndex={w.zIndex}
            defaultPosition={{ x: 100, y: 60 }}
            defaultSize={{ width: 700, height: 520 }}
            onFocus={onFocus}
            onClose={onClose}
            onMinimize={onMinimize}
        >
            <div className="flex flex-col h-full gap-2">
                {/* Toolbar */}
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Tools */}
                    <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
                        {TOOLS.map((t) => (
                            <button
                                key={t.id}
                                title={t.label}
                                onClick={() => setTool(t.id)}
                                className={`px-2 py-1 rounded-lg text-sm transition
                                    ${tool === t.id ? "bg-blue-500 text-white shadow" : "hover:bg-white text-gray-700"}
                                `}
                            >
                                {t.icon}
                            </button>
                        ))}
                    </div>

                    {/* Brush size */}
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                        <span>Size</span>
                        <input
                            type="range" min={1} max={40} value={brushSize}
                            onChange={(e) => setBrushSize(+e.target.value)}
                            className="w-20"
                        />
                        <span className="w-5 text-center">{brushSize}</span>
                    </div>

                    {/* Color picker */}
                    <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="w-8 h-8 rounded-lg border-2 border-gray-300 cursor-pointer"
                        title="Custom color"
                    />

                    {/* Palette */}
                    <div className="flex flex-wrap gap-1 max-w-[140px]">
                        {PALETTE.map((c) => (
                            <button
                                key={c}
                                onClick={() => setColor(c)}
                                style={{ background: c }}
                                className={`w-4 h-4 rounded-sm border transition
                                    ${color === c ? "border-blue-500 scale-125" : "border-gray-300 hover:scale-110"}
                                `}
                            />
                        ))}
                    </div>

                    <div className="ml-auto flex gap-2">
                        <button onClick={clear} className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700 transition">
                            Clear
                        </button>
                        <button onClick={save} className="px-3 py-1 rounded-lg bg-blue-500 hover:bg-blue-600 text-xs font-semibold text-white transition">
                            💾 Save PNG
                        </button>
                    </div>
                </div>

                {/* Canvas */}
                <div className="flex-1 rounded-xl border-2 border-gray-200 overflow-hidden bg-white" ref={containerRef}>
                    <canvas
                        ref={canvasRef}
                        onMouseDown={onMouseDown}
                        onMouseMove={onMouseMove}
                        onMouseUp={onMouseUp}
                        onMouseLeave={onMouseUp}
                        className="cursor-crosshair block"
                        style={{ width: "100%", height: "100%" }}
                    />
                </div>
            </div>
        </DraggableWindow>
    )
}