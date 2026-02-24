"use client"

import { useEffect, useState } from "react"
import { Workspace } from "@/types/tiling"

type Props = {
    workspaces: Workspace[]
    activeId: number
    occupiedIds: number[]
    focusedTitle: string | null
    splitDir: "horizontal" | "vertical"
    fullscreenId: string | null
    onSwitchWorkspace: (id: number) => void
}

function BarClock() {
    const [time, setTime] = useState("")
    useEffect(() => {
        const tick = () =>
            setTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }))
        tick()
        const id = setInterval(tick, 1000)
        return () => clearInterval(id)
    }, [])
    return <span>{time}</span>
}

export function I3StatusBar({
    workspaces,
    activeId,
    occupiedIds,
    focusedTitle,
    splitDir,
    fullscreenId,
    onSwitchWorkspace,
}: Props) {
    const occupiedSet = new Set(occupiedIds)

    return (
        <div className="fixed top-0 left-0 right-0 z-[9998] flex items-center justify-between h-7 px-0 bg-[#282828] text-[12px] font-mono select-none">
            {/* Left: workspace buttons */}
            <div className="flex items-center h-full">
                {workspaces.map((ws) => {
                    const isActive = ws.id === activeId
                    const isOccupied = occupiedSet.has(ws.id)

                    return (
                        <button
                            key={ws.id}
                            onClick={() => onSwitchWorkspace(ws.id)}
                            className={`
                                h-full px-3 border-b-2 transition-all duration-100 font-mono text-[12px] font-bold
                                ${isActive
                                    ? "bg-[#4c7899] text-white border-[#4c7899]"
                                    : isOccupied
                                        ? "bg-[#333333] text-[#888888] border-[#333333] hover:bg-[#444444] hover:text-white"
                                        : "bg-[#282828] text-[#555555] border-[#282828] hover:bg-[#333333] hover:text-[#888888]"
                                }
                            `}
                        >
                            {ws.id === 10 ? "0" : ws.id}
                        </button>
                    )
                })}
            </div>

            {/* Center: focused window title */}
            <div className="flex-1 text-center text-[#a0a0a0] truncate px-4">
                {fullscreenId
                    ? <span className="text-[#b8bb26]">⛶ fullscreen</span>
                    : focusedTitle
                        ? <span>{focusedTitle}</span>
                        : <span className="text-[#555555]">—</span>
                }
            </div>

            {/* Right: status */}
            <div className="flex items-center gap-3 px-3 text-[#a0a0a0]">
                <span className="text-[#83a598]">
                    {splitDir === "horizontal" ? "splith" : "splitv"}
                </span>
                <span className="text-[#555555]">|</span>
                <span className="text-[#d3869b]">
                    <BarClock />
                </span>
            </div>
        </div>
    )
}