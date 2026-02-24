import { App } from "@/types/App"

export const APPS: App[] = [
    { id: "terminal",    label: "Terminal",    icon: "🖥️",  shortcut: "Shift+T", description: "Command line interface" },
    { id: "youtube",     label: "YouTube",      icon: "▶️",  shortcut: "Shift+Y", description: "Watch YouTube videos" },
    { id: "browser",     label: "Browser",      icon: "🌐",  shortcut: "Shift+B", description: "Browse the web" },
    { id: "paint",       label: "Paint",       icon: "🎨",                        description: "Draw and create art" },
    { id: "texteditor",  label: "Text Editor", icon: "📝",                        description: "Write and edit text files" },
    { id: "powersearch", label: "PowerSearch", icon: "🔍",  shortcut: "Shift+Space", description: "Search apps, files, calculate" },
    { id: "about",       label: "About",       icon: "ℹ️",  shortcut: "Shift+A", description: "About archieOS" },
    { id: "settings",    label: "Settings",    icon: "⚙️",                        description: "Customize your desktop" },
    { id: "welcome",     label: "Welcome",     icon: "👋",  shortcut: "Shift+W", description: "Welcome screen" },
    { id: "launcher",    label: "App Launcher",icon: "🧩",  shortcut: "Shift+L", description: "Browse all apps" },
]