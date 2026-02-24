"use client"

import { useEffect, useRef } from "react"

const CHARS = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホ0123456789ABCDEF"
const FONT_SIZE = 14
const COLOR = "#00ff41"

export function MatrixCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const rafRef    = useRef<number>(0)

    useEffect(() => {
        const canvas = canvasRef.current!
        const ctx    = canvas.getContext("2d")!

        let cols: number[] = []

        const resize = () => {
            canvas.width  = window.innerWidth
            canvas.height = window.innerHeight
            cols = Array.from({ length: Math.floor(canvas.width / FONT_SIZE) }, () =>
                Math.floor(Math.random() * -(canvas.height / FONT_SIZE))
            )
        }
        resize()
        window.addEventListener("resize", resize)

        const draw = () => {
            ctx.fillStyle = "rgba(0,0,0,0.05)"
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            ctx.fillStyle = COLOR
            ctx.font      = `${FONT_SIZE}px monospace`

            cols.forEach((y, i) => {
                const char = CHARS[Math.floor(Math.random() * CHARS.length)]
                const x    = i * FONT_SIZE

                // Bright leading character
                ctx.fillStyle = "#afffbc"
                ctx.fillText(char, x, y * FONT_SIZE)

                // Normal color for trail
                ctx.fillStyle = COLOR
                if (y > 0) ctx.fillText(CHARS[Math.floor(Math.random() * CHARS.length)], x, (y - 1) * FONT_SIZE)

                if (y * FONT_SIZE > canvas.height && Math.random() > 0.975)
                    cols[i] = 0
                else
                    cols[i]++
            })

            rafRef.current = requestAnimationFrame(draw)
        }

        rafRef.current = requestAnimationFrame(draw)

        return () => {
            cancelAnimationFrame(rafRef.current)
            window.removeEventListener("resize", resize)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            style={{ background: "#000" }}
        />
    )
}