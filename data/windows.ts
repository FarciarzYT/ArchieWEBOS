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
        defaultSize: { width: 380, height: 280 },
        startVisible: false,
    },
    {
        id: "terminal",
        title: "Terminal",
        defaultPosition: { x: 180, y: 120 },
        defaultSize: { width: 580, height: 380 },
        startVisible: false,
    },
    {
        id: "settings",
        title: "Settings",
        defaultPosition: { x: 200, y: 100 },
        defaultSize: { width: 480, height: 420 },
        startVisible: false,
    },
    {
        id: "paint",
        title: "Paint",
        defaultPosition: { x: 100, y: 60 },
        defaultSize: { width: 700, height: 520 },
        startVisible: false,
    },
    {
        id: "texteditor",
        title: "Text Editor",
        defaultPosition: { x: 150, y: 80 },
        defaultSize: { width: 600, height: 480 },
        startVisible: false,
    },
    {
        id: "launcher",
        title: "App Launcher",
        defaultPosition: { x: 160, y: 100 },
        defaultSize: { width: 500, height: 420 },
        startVisible: false,
    },
    {
        id: "powersearch",
        title: "PowerSearch",
        defaultPosition: { x: 300, y: 150 },
        defaultSize: { width: 560, height: 400 },
        startVisible: false,
    },
    {
        id: "youtube",
        title: "YouTube",
        defaultPosition: { x: 120, y: 60 },
        defaultSize: { width: 700, height: 520 },
        startVisible: false,
    },
    {
        id: "browser",
        title: "Browser",
        defaultPosition: { x: 80, y: 50 },
        defaultSize: { width: 900, height: 620 },
        startVisible: false,
    },
]