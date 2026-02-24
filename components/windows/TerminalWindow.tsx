import { DraggableWindow } from "@/components/DraggableWindow"
import { WindowProps } from "@/types/window"

const NEOFETCH = `
   /\\      archie@webos
  /  \\     ─────────────
 / /\\ \\    OS: archieOS WebEdition
/ /__\\ \\   Kernel: Next.js 16
/  ____  \\  Shell: TypeScript 5.7
/_/    \\_\\ WM: i3wm-web
             Theme: Blue Frost
             Terminal: web-term
`

export function TerminalWindow({ window: w, onFocus, onClose, onMinimize }: WindowProps) {
    return (
        <DraggableWindow
            id="terminal"
            title="Terminal"
            visible={w.visible && !w.minimized}
            zIndex={w.zIndex}
            defaultPosition={{ x: 200, y: 160 }}
            defaultSize={{ width: 480, height: 300 }}
            onFocus={onFocus}
            onClose={onClose}
            onMinimize={onMinimize}
        >
            <div className="h-full rounded-lg bg-gray-900 p-3 font-mono text-sm text-green-400 overflow-auto">
                <TerminalLine command="neofetch" />
                <pre className="mt-2 text-xs leading-relaxed text-green-300/80">{NEOFETCH}</pre>
                <TerminalLine command="" cursor />
            </div>
        </DraggableWindow>
    )
}

function TerminalLine({ command, cursor = false }: { command: string; cursor?: boolean }) {
    return (
        <p className="mt-2">
            <span className="text-blue-400">archie@webos</span>
            <span className="text-white">:</span>
            <span className="text-cyan-400">~</span>
            <span className="text-white">$ </span>
            {command}
            {cursor && <span className="animate-pulse">_</span>}
        </p>
    )
}