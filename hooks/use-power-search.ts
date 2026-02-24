"use client"

import { useMemo } from "react"
import { APPS } from "@/data/apps"

export type SearchResult = {
    id: string
    type: "app" | "calc" | "tip"
    icon: string
    label: string
    sublabel?: string
    action: () => void
}

const MATH_RE = /^[\d\s+\-*/().%^]+$/

export function usePowerSearch(
    query: string,
    openWindow: (id: string) => void
): SearchResult[] {
    return useMemo(() => {
        const q = query.trim()
        if (!q) return []

        const results: SearchResult[] = []

        // ── Calculator ───────────────────────────────────────────────
        if (MATH_RE.test(q)) {
            try {
                // eslint-disable-next-line no-eval
                const raw = eval(q.replace(/\^/g, "**"))
                const num = typeof raw === "number" ? raw : Number(raw)
                if (!isNaN(num)) {
                    results.push({
                        id: "calc-result",
                        type: "calc",
                        icon: "🧮",
                        label: `= ${Number.isInteger(num) ? num : num.toFixed(8).replace(/\.?0+$/, "")}`,
                        sublabel: `${q}`,
                        action: () => {},
                    })
                }
            } catch {}
        }

        // ── App search ───────────────────────────────────────────────
        const ql = q.toLowerCase()
        APPS.filter((a) =>
            a.label.toLowerCase().includes(ql) ||
            (a.description ?? "").toLowerCase().includes(ql)
        ).forEach((a) =>
            results.push({
                id: `app-${a.id}`,
                type: "app",
                icon: a.icon,
                label: a.label,
                sublabel: a.description,
                action: () => openWindow(a.id),
            })
        )

        // ── Tip when no results ──────────────────────────────────────
        if (results.length === 0) {
            results.push({
                id: "no-results",
                type: "tip",
                icon: "💡",
                label: "No results found",
                sublabel: "Try an app name or a math expression like 12 * 8",
                action: () => {},
            })
        }

        return results
    }, [query, openWindow])
}