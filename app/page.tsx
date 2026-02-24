"use client"

import { useEffect } from "react"
import { useWindowManager } from "@/hooks/use-windows-manager"
import { Background }       from "@/components/base/Background"
import { TaskBar }          from "@/components/base/TaskBar"
import { WelcomeWindow }    from "@/components/windows/WelcomeWindow"
import { AboutWindow }      from "@/components/windows/AboutWindow"
import { TerminalWindow }   from "@/components/windows/TerminalWindow"
import { HelpMenu }         from "@/components/HelpMenu"
import { WINDOWS }          from "@/data/windows"

export default function DesktopPage() {
    const { windows, focus, close, minimize, restore, open } = useWindowManager(WINDOWS)

    const getWindow = (id: string) => windows.find((w) => w.id === id)!
    const handlers  = { onFocus: focus, onClose: close, onMinimize: minimize }

    // Keyboard shortcuts to open windows
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (!e.shiftKey) return
            const map: Record<string, string> = { w: "welcome", a: "about", t: "terminal" }
            const id = map[e.key.toLowerCase()]
            if (id) open(id)
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [open])

    return (
        <main className="relative h-screen w-screen overflow-hidden">
            <Background />

            <WelcomeWindow  window={getWindow("welcome")}  {...handlers} />
            <AboutWindow    window={getWindow("about")}    {...handlers} />
            <TerminalWindow window={getWindow("terminal")} {...handlers} />

            <TaskBar windows={windows} onRestore={restore} />
            <HelpMenu />
        </main>
    )
}