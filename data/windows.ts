export type WindowConfig = {
    id: string
    title: string
    defaultPosition?: { x: number; y: number }
    defaultSize?: { width: number; height: number }
    startVisible?: boolean
}

export const WINDOWS: WindowConfig[] = [
    {
        id: "welcome",
        title: "Welcome",
        defaultSize: { width: 420, height: 320 },
        startVisible: true,
    },
    {
        id: "about",
        title: "About",
        defaultPosition: { x: 120, y: 80 },
        defaultSize: { width: 380, height: 260 },
        startVisible: false,
    },
    {
        id: "terminal",
        title: "Terminal",
        defaultPosition: { x: 200, y: 160 },
        defaultSize: { width: 480, height: 300 },
        startVisible: false,
    },
]