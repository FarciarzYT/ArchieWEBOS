"use client"

import { useState, useCallback, useEffect } from "react"

export type Settings = {
    backgroundId: string
}

const STORAGE_KEY = "archieOS-settings"

const DEFAULT_SETTINGS: Settings = {
    backgroundId: "bluefrost",
}

export function useSettings() {
    // Always start with defaults so server and client render the same HTML
    const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
    const [hydrated, setHydrated] = useState(false)

    // After hydration, sync from localStorage
    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY)
            if (raw) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) })
        } catch {}
        setHydrated(true)
    }, [])

    const update = useCallback((patch: Partial<Settings>) => {
        setSettings((s) => {
            const next = { ...s, ...patch }
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
            return next
        })
    }, [])

    return { settings, update, hydrated }
}