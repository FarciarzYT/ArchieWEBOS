import { DraggableWindow } from "@/components/DraggableWindow"
import { WindowProps } from "@/types/window"

export function AboutWindow({ window: w, onFocus, onClose, onMinimize }: WindowProps) {
    return (
        <DraggableWindow
            id="about"
            title="About"
            visible={w.visible && !w.minimized}
            zIndex={w.zIndex}
            defaultPosition={{ x: 120, y: 80 }}
            defaultSize={{ width: 380, height: 260 }}
            onFocus={onFocus}
            onClose={onClose}
            onMinimize={onMinimize}
        >
            <div className="flex flex-col gap-3">
                <h2 className="text-xl font-bold text-blue-600">About archieOS</h2>
                <p className="text-sm leading-relaxed text-gray-700">
                    archieOS is a browser-based operating system experience built with Next.js,
                    TypeScript, and Tailwind CSS. It features a tiling window manager inspired
                    by i3wm, giving you full control over your workspace layout.
                </p>
                <div className="mt-2 rounded-xl bg-blue-50 p-3 text-xs text-blue-800 font-mono space-y-0.5">
                    <p>System: archieOS v0.1.0</p>
                    <p>Kernel: Next.js 16</p>
                    <p>Shell: TypeScript 5.7</p>
                    <p>WM: i3wm-web</p>
                </div>
            </div>
        </DraggableWindow>
    )
}