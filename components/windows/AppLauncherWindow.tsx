"use client"

import { useState } from "react"
import { APPS } from "@/data/apps"
import { WindowProps } from "@/types/window"

type Props = WindowProps & { onOpenApp: (id: string) => void }

export function AppLauncherWindow({ window: w, onFocus, onClose, onMinimize, onOpenApp }: Props) {
    const [query, setQuery] = useState("")

    const filtered = APPS.filter((a) =>
        a.label.toLowerCase().includes(query.toLowerCase()) ||
        (a.description ?? "").toLowerCase().includes(query.toLowerCase())
    )

    return (
        <div className="flex flex-col h-full gap-3 p-4">
            <div className="relative">
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search apps..."
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-blue-200 bg-blue-50 text-sm outline-none focus:ring-2 focus:ring-blue-300"
                    autoFocus
                />
            </div>

            <div className="flex-1 overflow-auto">
                <div className="grid grid-cols-3 gap-3">
                    {filtered.map((app) => (
                        <button
                            key={app.id}
                            onClick={() => { onOpenApp(app.id); onClose("launcher") }}
                            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/60 border border-blue-100 hover:bg-blue-50 hover:border-blue-300 hover:shadow-md transition-all group"
                        >
                            <span className="text-4xl group-hover:scale-110 transition-transform">
                                {app.icon}
                            </span>
                            <span className="text-xs font-semibold text-gray-700">{app.label}</span>
                            {app.shortcut && (
                                <span className="text-[10px] text-gray-400 font-mono">{app.shortcut}</span>
                            )}
                        </button>
                    ))}
                    {filtered.length === 0 && (
                        <p className="col-span-3 text-center text-sm text-gray-400 mt-8">No apps found</p>
                    )}
                </div>
            </div>
        </div>
    )
}