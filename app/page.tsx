"use client"

import { useEffect, useRef, useState } from "react"
import { useWindowManager } from "@/hooks/use-windows-manager"
import { useSettings } from "@/hooks/use-settings"
import { useTilingManager } from "@/hooks/use-tiling-manager"
import { useI3Keybindings } from "@/hooks/use-i3-keybindings"
import { computeRects } from "@/hooks/use-tiling-manager"
import { Background } from "@/components/base/Background"
import { TaskBar } from "@/components/base/TaskBar"
import { HelpMenu } from "@/components/HelpMenu"
import { TilingLayout } from "@/components/TilingLayout"
import { I3StatusBar } from "@/components/I3StatusBar"
import { I3TitleBar } from "@/components/WindowContent"
import { DmenuOverlay } from "@/components/DmenuOverlay"
import { DraggableWindow } from "@/components/DraggableWindow"
import { WelcomeWindow } from "@/components/windows/WelcomeWindow"
import { AboutWindow } from "@/components/windows/AboutWindow"
import { TerminalWindow } from "@/components/windows/TerminalWindow"
import { SettingsWindow } from "@/components/windows/SettingsWindow"
import { PaintWindow } from "@/components/windows/PaintWindow"
import { TextEditorWindow } from "@/components/windows/TextEditorWindow"
import { AppLauncherWindow } from "@/components/windows/AppLauncherWindow"
import { PowerSearchWindow } from "@/components/windows/PowerSearchWindow"
import { YoutubeWindow } from "@/components/windows/YoutubeWindow"
import { BrowserWindow } from "@/components/windows/BrowserWindow"
import { WINDOWS } from "@/data/windows"

export default function DesktopPage() {
    const { settings, update, hydrated } = useSettings()
    const wm = useWindowManager(WINDOWS)
    const { windows, focus: wmFocus, close: wmClose, minimize: wmMinimize, restore, open } = wm

    const tiling = useTilingManager()
    const {
        layout, tileWindow, untileWindow,
        focus: tilingFocus, focusDirection, moveDirection,
        setSplitDirection, toggleFloating, toggleFullscreen,
        resizeSlot, switchWorkspace, moveToWorkspace,
        activeWorkspaceId, workspaces, occupiedWorkspaces,
        TASKBAR_H, STATUS_BAR_H,
    } = tiling

    const nextSplitDir = useRef<"horizontal" | "vertical">("horizontal")
    const [screenSize, setScreenSize] = useState({ w: 1280, h: 800 })
    const [dmenuOpen, setDmenuOpen] = useState(false)

    useEffect(() => {
        const update = () => setScreenSize({ w: window.innerWidth, h: window.innerHeight })
        update()
        window.addEventListener("resize", update)
        return () => window.removeEventListener("resize", update)
    }, [])

    // ── Auto-tile windows with startVisible on first mount ──────────────────
    const initialized = useRef(false)
    useEffect(() => {
        if (initialized.current) return
        initialized.current = true
        WINDOWS.forEach(w => {
            if (w.startVisible) {
                tileWindow(w.id, "horizontal")
            }
        })
    }, [tileWindow])

    // ── Unified close: remove from tiling + hide in wm ──────────────────────
    const closeWindow = (id: string) => {
        untileWindow(id)
        wmClose(id)
    }

    // ── Open window: add to tiling tree ─────────────────────────────────────
    const openWindow = (id: string) => {
        open(id)
        if (layout.floating.includes(id)) return
        tileWindow(id, nextSplitDir.current)
    }

    // ── Minimize: remove from tiling but keep in wm ─────────────────────────
    const minimizeWindow = (id: string) => {
        untileWindow(id)
        wmMinimize(id)
    }

    // ── Restore: put back in tiling ──────────────────────────────────────────
    const restoreWindow = (id: string) => {
        restore(id)
        tileWindow(id, nextSplitDir.current)
    }

    // ── Focus: sync both managers ────────────────────────────────────────────
    const focusWindow = (id: string) => {
        wmFocus(id)
        tilingFocus(id)
    }

    // ── Shared handlers ──────────────────────────────────────────────────────
    const handlers = {
        onFocus: focusWindow,
        onClose: closeWindow,
        onMinimize: minimizeWindow,
    }

    // ── i3 keybindings ───────────────────────────────────────────────────────
    const tiledIds = layout.root
        ? Array.from(computeRects(layout.root, { x: 0, y: 0, width: screenSize.w, height: screenSize.h - STATUS_BAR_H - TASKBAR_H }).keys())
        : []

    useI3Keybindings({
        focusedId: layout.focused,
        tileWindow,
        untileWindow,
        focusDirection: (dir, w, h) => focusDirection(dir, w, h),
        moveDirection: (dir, w, h) => moveDirection(dir, w, h),
        setSplitDir: setSplitDirection,
        toggleFloating: (id) => toggleFloating(id),
        toggleFullscreen,
        resizeSlot,
        closeWindow,
        openTerminal: () => openWindow("terminal"),
        openDmenu: () => setDmenuOpen(v => !v),
        nextSplitDir,
        switchWorkspace,
        moveToWorkspace,
        focusTile: focusWindow,
    })

    // App shortcuts (Terminal: Alt+Enter, Launcher: Alt+D) are handled by useI3Keybindings

    // ── Compute which windows are tiled vs floating ──────────────────────────
    const floatingSet = new Set(layout.floating)
    const getWin = (id: string) => windows.find((w) => w.id === id)!

    // ── Render tiled window content (inside TileFrame) ───────────────────────
    const renderTiledContent = (id: string) => {
        const win = getWin(id)
        if (!win) return null
        const tileHandlers = {
            onFocus: focusWindow,
            onClose: closeWindow,
            onMinimize: minimizeWindow,
        }
        return (
            <>
                <I3TitleBar
                    title={win.title}
                    isFocused={layout.focused === id}
                    onClose={() => closeWindow(id)}
                    onMinimize={() => minimizeWindow(id)}
                />
                <div className="flex-1 overflow-auto">
                    {renderWindowContent(id, tileHandlers)}
                </div>
            </>
        )
    }

    const renderWindowContent = (
        id: string,
        h: typeof handlers,
    ): React.ReactNode => {
        const win = getWin(id)
        if (!win) return null

        switch (id) {
            case "welcome": return <WelcomeWindow window={win} {...h} />
            case "about": return <AboutWindow window={win} {...h} />
            case "terminal": return <TerminalWindow window={win} {...h} />
            case "paint": return <PaintWindow window={win} {...h} />
            case "texteditor": return <TextEditorWindow window={win} {...h} />
            case "youtube": return <YoutubeWindow window={win} {...h} />
            case "browser": return <BrowserWindow window={win} {...h} />
            case "launcher":
                return <AppLauncherWindow window={win} {...h} onOpenApp={openWindow} />
            case "powersearch":
                return <PowerSearchWindow window={win} {...h} onOpenApp={openWindow} />
            case "settings":
                return <SettingsWindow window={win} {...h}
                    currentBg={settings.backgroundId}
                    onChangeBg={(bgId) => update({ backgroundId: bgId })} />
            default: return null
        }
    }

    // Focused window title for status bar
    const focusedWin = windows.find((w) => w.id === layout.focused)
    const focusedTitle = focusedWin?.title ?? null

    return (
        <main className="relative h-screen w-screen overflow-hidden" style={{ paddingTop: STATUS_BAR_H }}>
            {/* ── Background ───────────────────────────────────────── */}
            <Background backgroundId={hydrated ? settings.backgroundId : "bluefrost"} />

            {/* ── i3 status bar (top) ──────────────────────────────── */}
            <I3StatusBar
                workspaces={workspaces}
                activeId={activeWorkspaceId}
                occupiedIds={occupiedWorkspaces}
                focusedTitle={focusedTitle}
                splitDir={nextSplitDir.current}
                fullscreenId={layout.fullscreen}
                onSwitchWorkspace={switchWorkspace}
            />

            {/* ── Tiled windows ────────────────────────────────────── */}
            <TilingLayout
                layout={layout}
                windows={windows}
                screenW={screenSize.w}
                screenH={screenSize.h}
                taskbarH={TASKBAR_H}
                statusBarH={STATUS_BAR_H}
                onFocus={focusWindow}
                onResize={resizeSlot}
                renderWindow={renderTiledContent}
            />

            {/* ── Floating windows ─────────────────────────────────── */}
            {Array.from(floatingSet).map((id) => {
                const win = getWin(id)
                if (!win?.visible || win.minimized) return null
                return (
                    <DraggableWindow
                        key={id}
                        id={id}
                        title={win.title}
                        visible={win.visible}
                        zIndex={win.zIndex}
                        onFocus={focusWindow}
                        onClose={closeWindow}
                        onMinimize={minimizeWindow}
                    >
                        {renderWindowContent(id, handlers)}
                    </DraggableWindow>
                )
            })}

            {/* ── dmenu overlay ─────────────────────────────────────── */}
            <DmenuOverlay
                visible={dmenuOpen}
                onClose={() => setDmenuOpen(false)}
                onLaunch={(id) => openWindow(id)}
            />

            {/* ── Bottom bar (minimized windows) ───────────────────── */}
            <TaskBar windows={windows} onRestore={restoreWindow} onOpenApp={openWindow} />

            {/* ── Help menu ────────────────────────────────────────── */}
            <HelpMenu />
        </main>
    )
}