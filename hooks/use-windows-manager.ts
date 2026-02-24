"use client"

import { useState, useCallback } from "react"
import { WindowState } from "@/types/window"

type InitialWindow = Omit<WindowState, "zIndex" | "visible" | "minimized"> & {
    startVisible?: boolean
}

export function useWindowManager(initial: InitialWindow[]) {
    const [windows, setWindows] = useState<WindowState[]>(() =>
        initial.map((w, i) => ({
            ...w,
            visible: w.startVisible ?? false,
            minimized: false,
            zIndex: i + 1,
        }))
    )

    const maxZ = (ws: WindowState[]) => Math.max(0, ...ws.map((w) => w.zIndex))

    /** Bring a window to the front */
    const focus = useCallback((id: string) => {
        setWindows((prev) =>
            prev.map((w) => (w.id === id ? { ...w, zIndex: maxZ(prev) + 1 } : w))
        )
    }, [])

    /** Close (hide) a window */
    const close = useCallback((id: string) => {
        setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, visible: false } : w)))
    }, [])

    /** Minimize a window */
    const minimize = useCallback((id: string) => {
        setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, minimized: true } : w)))
    }, [])

    /** Restore a minimized/closed window */
    const restore = useCallback((id: string) => {
        setWindows((prev) => {
            const z = maxZ(prev)
            return prev.map((w) =>
                w.id === id ? { ...w, minimized: false, visible: true, zIndex: z + 1 } : w
            )
        })
    }, [])

    /** Open a previously closed window */
    const open = useCallback((id: string) => {
        setWindows((prev) => {
            const z = maxZ(prev)
            return prev.map((w) =>
                w.id === id ? { ...w, visible: true, minimized: false, zIndex: z + 1 } : w
            )
        })
    }, [])

    /** Add a brand-new window at runtime */
    const addWindow = useCallback(
        (win: Omit<WindowState, "zIndex" | "visible" | "minimized">) => {
            setWindows((prev) => [
                ...prev,
                { ...win, visible: true, minimized: false, zIndex: maxZ(prev) + 1 },
            ])
        },
        []
    )

    return { windows, focus, close, minimize, restore, open, addWindow }
}