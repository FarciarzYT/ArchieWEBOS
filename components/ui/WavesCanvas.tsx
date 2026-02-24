"use client"

import { useEffect, useRef } from "react"

type Wave = {
    amplitude: number
    frequency: number
    speed: number
    color: string
    offset: number
}

const WAVES: Wave[] = [
    { amplitude: 60,  frequency: 0.012, speed: 0.008, color: "rgba(99,179,237,0.35)",  offset: 0 },
    { amplitude: 50,  frequency: 0.018, speed: 0.013, color: "rgba(66,153,225,0.30)",  offset: 2 },
    { amplitude: 40,  frequency: 0.025, speed: 0.020, color: "rgba(49,130,206,0.25)",  offset: 4 },
    { amplitude: 30,  frequency: 0.030, speed: 0.028, color: "rgba(144,205,244,0.20)", offset: 6 },
]

export function WavesCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const rafRef    = useRef<number>(0)
    const wavesRef  = useRef<Wave[]>(WAVES.map((w) => ({ ...w })))

    useEffect(() => {
        const canvas = canvasRef.current!
        const ctx    = canvas.getContext("2d")!

        const resize = () => {
            canvas.width  = window.innerWidth
            canvas.height = window.innerHeight
        }
        resize()
        window.addEventListener("resize", resize)

        const draw = () => {
            const { width, height } = canvas
            ctx.clearRect(0, 0, width, height)

            wavesRef.current.forEach((wave) => {
                wave.offset += wave.speed
                ctx.beginPath()
                ctx.moveTo(0, height)
                for (let x = 0; x <= width; x += 2) {
                    const y =
                        height * 0.55 +
                        Math.sin(x * wave.frequency + wave.offset) * wave.amplitude +
                        Math.sin(x * wave.frequency * 0.5 + wave.offset * 1.3) * (wave.amplitude * 0.4)
                    ctx.lineTo(x, y)
                }
                ctx.lineTo(width, height)
                ctx.closePath()
                ctx.fillStyle = wave.color
                ctx.fill()
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
            style={{ background: "linear-gradient(to bottom, #bfdbfe, #e0f2fe)" }}
        />
    )
}