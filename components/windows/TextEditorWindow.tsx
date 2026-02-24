"use client"

import { useState, useRef, useCallback } from "react"
import { DraggableWindow } from "@/components/DraggableWindow"
import { WindowProps } from "@/types/window"

type FormatCmd = "bold" | "italic" | "underline" | "strikeThrough"

const FONT_SIZES = ["12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px"]

export function TextEditorWindow({ window: w, onFocus, onClose, onMinimize }: WindowProps) {
    const [fileName, setFileName]   = useState("untitled.txt")
    const [saved,    setSaved]      = useState(true)
    const [fontSize, setFontSize]   = useState("14px")
    const editorRef = useRef<HTMLDivElement>(null)

    const exec = useCallback((cmd: FormatCmd) => {
        document.execCommand(cmd, false)
        editorRef.current?.focus()
    }, [])

    const onInput = () => setSaved(false)

    const saveFile = () => {
        const text = editorRef.current?.innerText ?? ""
        const blob = new Blob([text], { type: "text/plain" })
        const a    = document.createElement("a")
        a.href     = URL.createObjectURL(blob)
        a.download = fileName
        a.click()
        setSaved(true)
    }

    const openFile = () => {
        const input = document.createElement("input")
        input.type  = "file"
        input.accept = ".txt,.md,.js,.ts,.html,.css,.json"
        input.onchange = () => {
            const file = input.files?.[0]
            if (!file) return
            const reader = new FileReader()
            reader.onload = () => {
                if (editorRef.current) {
                    editorRef.current.innerText = reader.result as string
                    setSaved(true)
                    setFileName(file.name)
                }
            }
            reader.readAsText(file)
        }
        input.click()
    }

    const newFile = () => {
        if (editorRef.current) editorRef.current.innerHTML = ""
        setFileName("untitled.txt")
        setSaved(true)
    }

    const TOOLS: { cmd: FormatCmd; icon: string; label: string }[] = [
        { cmd: "bold",          icon: "B",  label: "Bold (Ctrl+B)" },
        { cmd: "italic",        icon: "I",  label: "Italic (Ctrl+I)" },
        { cmd: "underline",     icon: "U",  label: "Underline (Ctrl+U)" },
        { cmd: "strikeThrough", icon: "S̶",  label: "Strikethrough" },
    ]

    return (
        <DraggableWindow
            id="texteditor"
            title={`Text Editor — ${fileName}${saved ? "" : " •"}`}
            visible={w.visible && !w.minimized}
            zIndex={w.zIndex}
            defaultPosition={{ x: 150, y: 80 }}
            defaultSize={{ width: 600, height: 480 }}
            onFocus={onFocus}
            onClose={onClose}
            onMinimize={onMinimize}
        >
            <div className="flex flex-col h-full gap-2">
                {/* Toolbar */}
                <div className="flex items-center gap-2 flex-wrap">
                    {/* File ops */}
                    <div className="flex gap-1">
                        <button onClick={newFile}  className="px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700 transition">New</button>
                        <button onClick={openFile} className="px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700 transition">Open</button>
                        <button onClick={saveFile} className="px-2 py-1 rounded-lg bg-blue-500 hover:bg-blue-600 text-xs font-semibold text-white transition">
                            {saved ? "💾 Save" : "💾 Save*"}
                        </button>
                    </div>

                    <div className="w-px h-5 bg-gray-200" />

                    {/* Format buttons */}
                    <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
                        {TOOLS.map((t) => (
                            <button
                                key={t.cmd}
                                title={t.label}
                                onMouseDown={(e) => { e.preventDefault(); exec(t.cmd) }}
                                className="px-2 py-0.5 rounded-lg text-sm font-bold text-gray-700 hover:bg-white hover:shadow transition"
                            >
                                {t.icon}
                            </button>
                        ))}
                    </div>

                    {/* Font size */}
                    <select
                        value={fontSize}
                        onChange={(e) => {
                            setFontSize(e.target.value)
                            if (editorRef.current) editorRef.current.style.fontSize = e.target.value
                        }}
                        className="text-xs border border-gray-200 rounded-lg px-1 py-1 bg-white outline-none"
                    >
                        {FONT_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>

                    {/* Filename */}
                    <input
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                        className="ml-auto text-xs border border-gray-200 rounded-lg px-2 py-1 outline-none focus:border-blue-400 w-36"
                        placeholder="filename.txt"
                    />
                </div>

                {/* Editor */}
                <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={onInput}
                    spellCheck={false}
                    className="flex-1 overflow-auto rounded-xl border border-gray-200 p-4 outline-none focus:border-blue-300 bg-white text-gray-800 leading-relaxed"
                    style={{ fontSize, fontFamily: "Georgia, serif", minHeight: 0 }}
                    data-placeholder="Start typing..."
                />

                {/* Word count */}
                <div className="text-[10px] text-gray-400 text-right">
                    {(editorRef.current?.innerText.trim().split(/\s+/).filter(Boolean).length ?? 0)} words
                </div>
            </div>
        </DraggableWindow>
    )
}