"use client"

import { useEffect } from "react"
import { useWindowManager }       from "@/hooks/use-windows-manager"
import { useSettings }            from "@/hooks/use-settings"
import { Background }             from "@/components/base/Background"
import { TaskBar }                from "@/components/base/TaskBar"
import { HelpMenu }               from "@/components/HelpMenu"
import { WelcomeWindow }          from "@/components/windows/WelcomeWindow"
import { AboutWindow }            from "@/components/windows/AboutWindow"
import { TerminalWindow }         from "@/components/windows/TerminalWindow"
import { SettingsWindow }         from "@/components/windows/SettingsWindow"
import { PaintWindow }            from "@/components/windows/PaintWindow"
import { TextEditorWindow }       from "@/components/windows/TextEditorWindow"
import { AppLauncherWindow }      from "@/components/windows/AppLauncherWindow"
import { PowerSearchWindow }      from "@/components/windows/PowerSearchWindow"
import { YoutubeWindow }          from "@/components/windows/YoutubeWindow"
import { BrowserWindow }          from "@/components/windows/BrowserWindow"
import { WINDOWS }                from "@/data/windows"

export default function DesktopPage() {
    const { settings, update, hydrated }                        = useSettings()
    const { windows, focus, close, minimize, restore, open }    = useWindowManager(WINDOWS)

    const getWin     = (id: string) => windows.find((w) => w.id === id)!
    const handlers   = { onFocus: focus, onClose: close, onMinimize: minimize }

    // ── Global keyboard shortcuts ────────────────────────────────────
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (!e.shiftKey) return
            const map: Record<string, string> = {
                w: "welcome",
                a: "about",
                t: "terminal",
                l: "launcher",
                y: "youtube",
                b: "browser",
                " ": "powersearch",
            }
            const id = map[e.key.toLowerCase()] ?? map[e.key]
            if (id) { e.preventDefault(); open(id) }
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [open])

    return (
        <main className="relative h-screen w-screen overflow-hidden">
            {/* ── Background — only render after hydration to avoid SSR mismatch ── */}
            <Background backgroundId={hydrated ? settings.backgroundId : "bluefrost"} />

            {/* ── Windows ────────────────────────────────────────────── */}
            <WelcomeWindow    window={getWin("welcome")}     {...handlers} />
            <AboutWindow      window={getWin("about")}       {...handlers} />
            <TerminalWindow   window={getWin("terminal")}    {...handlers} />
            <PaintWindow      window={getWin("paint")}       {...handlers} />
            <TextEditorWindow window={getWin("texteditor")}  {...handlers} />
            <AppLauncherWindow
                window={getWin("launcher")}
                {...handlers}
                onOpenApp={open}
            />
            <PowerSearchWindow
                window={getWin("powersearch")}
                {...handlers}
                onOpenApp={open}
            />
            <SettingsWindow
                window={getWin("settings")}
                {...handlers}
                currentBg={settings.backgroundId}
                onChangeBg={(id) => update({ backgroundId: id })}
            />

            {/* ── Taskbar & Help ─────────────────────────────────────── */}
            <YoutubeWindow        window={getWin("youtube")}       {...handlers} />
            <BrowserWindow        window={getWin("browser")}       {...handlers} />

            <TaskBar windows={windows} onRestore={restore} />
            <HelpMenu />
        </main>
    )
}