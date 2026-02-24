"use client"

import { useEffect } from "react"

/**
 * i3wm-style keyboard bindings.
 * Mod key = Alt (altKey). Using Alt to avoid conflicts with OS shortcuts.
 *
 * Alt+Enter          → open terminal
 * Alt+D              → open dmenu (PowerSearch overlay)
 * Ctrl+Q             → close focused window
 * Alt+Shift+Q        → close focused window (legacy i3)
 * Alt+H/J/K/L        → focus left/down/up/right
 * Alt+Shift+H/J/K/L  → move focused window
 * Alt+V              → split next window vertically
 * Alt+B              → split next window horizontally
 * Alt+Shift+Space    → toggle floating for focused window
 * Alt+F              → toggle fullscreen for focused window
 * Alt+1..9,0         → switch to workspace 1..9,10
 * Alt+Shift+1..9,0   → move focused window to workspace
 */

type Bindings = {
    focusedId: string | null
    tileWindow: (id: string, dir: "horizontal" | "vertical") => void
    untileWindow: (id: string) => void
    focusDirection: (dir: "left" | "right" | "up" | "down", w: number, h: number) => void
    moveDirection: (dir: "left" | "right" | "up" | "down", w: number, h: number) => void
    setSplitDir: (dir: "horizontal" | "vertical") => void
    toggleFloating: (id: string) => void
    toggleFullscreen: (id: string) => void
    resizeSlot: (delta: number) => void
    closeWindow: (id: string) => void
    openTerminal: () => void
    openDmenu: () => void
    nextSplitDir: React.MutableRefObject<"horizontal" | "vertical">
    switchWorkspace: (ws: number) => void
    moveToWorkspace: (windowId: string, ws: number) => void
    focusTile: (id: string) => void
}

export function useI3Keybindings(b: Bindings) {
    useEffect(() => {
        const DIRS: Record<string, "left" | "right" | "up" | "down"> = {
            h: "left", j: "down", k: "up", l: "right",
            ArrowLeft: "left", ArrowDown: "down", ArrowUp: "up", ArrowRight: "right",
        }

        const onKey = (e: KeyboardEvent) => {
            // Don't intercept when typing in an input
            const tag = (e.target as HTMLElement).tagName
            if (tag === "INPUT" || tag === "TEXTAREA") return

            // Ctrl+Q → close focused
            if (e.ctrlKey && e.key.toLowerCase() === "q") {
                e.preventDefault()
                if (b.focusedId) b.closeWindow(b.focusedId)
                return
            }

            if (!e.altKey) return

            const key = e.key
            const sw = window.innerWidth
            const sh = window.innerHeight

            // Alt+Enter → open terminal
            if (key === "Enter") { e.preventDefault(); b.openTerminal(); return }

            // Alt+D → open dmenu
            if (!e.shiftKey && key === "d") { e.preventDefault(); b.openDmenu(); return }

            // Alt+Shift+Q → close focused
            if (e.shiftKey && key === "Q") {
                e.preventDefault()
                if (b.focusedId) b.closeWindow(b.focusedId)
                return
            }

            // Alt+Shift+Space → toggle floating
            if (e.shiftKey && key === " ") {
                e.preventDefault()
                if (b.focusedId) b.toggleFloating(b.focusedId)
                return
            }

            // Alt+F → toggle fullscreen
            if (!e.shiftKey && key === "f") {
                e.preventDefault()
                if (b.focusedId) b.toggleFullscreen(b.focusedId)
                return
            }

            // Alt+V → next split vertical
            if (!e.shiftKey && key === "v") {
                e.preventDefault()
                b.nextSplitDir.current = "vertical"
                return
            }

            // Alt+B → next split horizontal
            if (!e.shiftKey && key === "b") {
                e.preventDefault()
                b.nextSplitDir.current = "horizontal"
                return
            }

            // Alt+H/J/K/L → focus direction
            const dir = DIRS[key.toLowerCase()]
            if (dir && !e.shiftKey) {
                e.preventDefault()
                b.focusDirection(dir, sw, sh)
                return
            }

            // Alt+Shift+H/J/K/L → move direction
            const shiftDir = DIRS[key.toLowerCase()]
            if (shiftDir && e.shiftKey) {
                e.preventDefault()
                b.moveDirection(shiftDir, sw, sh)
                return
            }

            // Alt+1..9,0 → workspace switch (0 = workspace 10)
            // Alt+Shift+1..9,0 → move window to workspace
            const wsKeys: Record<string, number> = {
                "1": 1, "2": 2, "3": 3, "4": 4, "5": 5,
                "6": 6, "7": 7, "8": 8, "9": 9, "0": 10,
                "!": 1, "@": 2, "#": 3, "$": 4, "%": 5,
                "^": 6, "&": 7, "*": 8, "(": 9, ")": 10,
            }
            const wsNum = wsKeys[key]
            if (wsNum !== undefined) {
                e.preventDefault()
                if (e.shiftKey && b.focusedId) {
                    b.moveToWorkspace(b.focusedId, wsNum)
                } else if (!e.shiftKey) {
                    b.switchWorkspace(wsNum)
                }
                return
            }
        }

        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [b])
}