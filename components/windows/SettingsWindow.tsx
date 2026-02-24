"use client"

import { BACKGROUNDS } from "@/data/background"
import { WindowProps } from "@/types/window"

type Props = WindowProps & {
    currentBg: string
    onChangeBg: (id: string) => void
}

export function SettingsWindow({ window: w, onFocus, onClose, onMinimize, currentBg, onChangeBg }: Props) {
    return (
        <div className="flex flex-col gap-5 h-full overflow-auto p-4">
            <div>
                <h2 className="text-xl font-extrabold text-blue-700">⚙️ Settings</h2>
                <p className="text-xs text-gray-500 mt-0.5">Customize your archieOS experience</p>
            </div>

            <hr className="border-blue-100" />

            <div>
                <h3 className="text-sm font-bold text-gray-700 mb-3">🖼 Desktop Background</h3>
                <div className="grid grid-cols-3 gap-3">
                    {BACKGROUNDS.map((bg) => (
                        <button
                            key={bg.id}
                            onClick={() => onChangeBg(bg.id)}
                            className={`
                                relative rounded-xl overflow-hidden h-20 border-2 transition-all
                                ${currentBg === bg.id
                                    ? "border-blue-500 scale-105 shadow-lg shadow-blue-200"
                                    : "border-transparent hover:border-blue-300 hover:scale-102"
                                }
                            `}
                        >
                            <div className="absolute inset-0" style={{ background: bg.preview }} />
                            {bg.type === "animated" && (
                                <span className="absolute top-1 right-1 text-[9px] bg-black/40 text-white px-1 rounded">
                                    LIVE
                                </span>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 bg-black/30 text-white text-[11px] font-semibold py-0.5 text-center">
                                {bg.label}
                            </div>
                            {currentBg === bg.id && (
                                <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                                    <span className="text-white text-[10px]">✓</span>
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <hr className="border-blue-100" />

            <div>
                <h3 className="text-sm font-bold text-gray-700 mb-2">🖥 System</h3>
                <div className="rounded-xl bg-gray-50 p-3 text-xs font-mono text-gray-600 space-y-1">
                    <p>archieOS v0.1.0</p>
                    <p>Kernel: Next.js 16</p>
                    <p>Shell: TypeScript 5.7</p>
                    <p>WM: i3wm-web</p>
                </div>
            </div>
        </div>
    )
}