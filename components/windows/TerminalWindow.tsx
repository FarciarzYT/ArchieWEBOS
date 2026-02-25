"use client"

import { useRef, useState, useEffect, KeyboardEvent } from "react"
import { useTerminal } from "@/hooks/use-terminal"
import { WindowProps } from "@/types/window"

export function TerminalWindow({
    window: w,
    onFocus,
    onClose,
    onMinimize
}: WindowProps) {
    const { lines, run, prompt, navigateHistory, addLine } = useTerminal()
    const [input, setInput] = useState("")
    const bottomRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // auto-scroll
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [lines])

    // BOOT SEQUENCE – dzieje się samo
    useEffect(() => {
        addLine({ type: "system", text: "Booting WebOS Terminal..." })
        addLine({ type: "system", text: "Loading modules..." })
        addLine({ type: "system", text: "System ready." })
        addLine({ type: "system", text: "Type 'help' to see available commands." })

        // focus input po starcie
        setTimeout(() => {
            inputRef.current?.focus()
        }, 100)
    }, [addLine])

    const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            if (input.trim() !== "") {
                run(input)
                setInput("")
            }
        } else if (e.key === "ArrowUp") {
            e.preventDefault()
            setInput(navigateHistory("up"))
        } else if (e.key === "ArrowDown") {
            e.preventDefault()
            setInput(navigateHistory("down"))
        }
    }

    return (
        <div
            className="h-full rounded-lg bg-gray-950 p-3 font-mono text-sm overflow-auto flex flex-col"
            onClick={() => inputRef.current?.focus()}
        >
            <div className="flex-1">
                {lines.map((line, i) => (
                    <div
                        key={i}
                        className={
                            line.type === "input"
                                ? "text-white mt-1"
                                : line.type === "error"
                                    ? "text-red-400"
                                    : line.type === "system"
                                        ? "text-blue-400"
                                        : "text-green-300"
                        }
                    >
                        {line.type === "input" && (
                            <span>
                                <span className="text-blue-400">archie</span>
                                <span className="text-gray-500">@</span>
                                <span className="text-cyan-400">webos</span>
                                <span className="text-gray-400">:</span>
                                <span className="text-yellow-400">{prompt}</span>
                                <span className="text-white">$ </span>
                            </span>
                        )}
                        <span style={{ whiteSpace: "pre-wrap" }}>
                            {line.text}
                        </span>
                    </div>
                ))}
            </div>

            {/* PROMPT */}
            <div className="flex items-center mt-1 text-white">
                <span className="text-blue-400">archie</span>
                <span className="text-gray-500">@</span>
                <span className="text-cyan-400">webos</span>
                <span className="text-gray-400">:</span>
                <span className="text-yellow-400">{prompt}</span>
                <span className="text-white mr-1">$</span>
                <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    className="flex-1 bg-transparent outline-none caret-green-400 text-green-300"
                    spellCheck={false}
                />
            </div>

            <div ref={bottomRef} />
        </div>
    )
}