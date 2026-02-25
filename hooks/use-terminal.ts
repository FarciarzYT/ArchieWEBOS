"use client"

import { useState, useCallback } from "react"

export type TerminalLine = {
    type: "input" | "output" | "error" | "system"
    text: string
}

// ── File system mock ─────────────────────────────────────────────────────────
type FSNode = { type: "file"; content: string } | { type: "dir"; children: Record<string, FSNode> }

const INITIAL_FS: Record<string, FSNode> = {
    home: {
        type: "dir",
        children: {
            archie: {
                type: "dir",
                children: {
                    Documents: {
                        type: "dir",
                        children: {
                            "readme.txt": { type: "file", content: "Welcome to archieOS!\nType 'help' for available commands." },
                            "notes.txt": { type: "file", content: "My notes go here..." },
                        },
                    },
                    Desktop: { type: "dir", children: {} },
                    Downloads: { type: "dir", children: {} },
                    ".bashrc": { type: "file", content: "# archieOS shell config\nexport PATH=/usr/bin:/bin" },
                },
            },
        },
    },
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function getNode(fs: Record<string, FSNode>, parts: string[]): FSNode | null {
    let node: FSNode = { type: "dir", children: fs }
    for (const part of parts) {
        if (node.type !== "dir" || !node.children[part]) return null
        node = node.children[part]
    }
    return node
}

function resolvePath(cwd: string[], input: string): string[] {
    if (!input || input === "~") return ["home", "archie"]
    const parts = input.startsWith("/")
        ? input.split("/").filter(Boolean)
        : [...cwd, ...input.split("/").filter(Boolean)]
    const resolved: string[] = []
    for (const p of parts) {
        if (p === "..") resolved.pop()
        else if (p !== ".") resolved.push(p)
    }
    return resolved
}

const HELP_TEXT = `
Available commands:
  help              show this help
  clear             clear the terminal
  echo [text]       print text
  date              show current date/time
  whoami            show current user
  pwd               print working directory
  ls [path]         list directory contents
  cd [path]         change directory
  cat [file]        read a file
  mkdir [name]      create a directory
  touch [name]      create a file
  rm [name]         remove a file or directory
  uname             show system info
  neofetch          show system info with art
  calc [expr]       evaluate a math expression
  history           show command history
  uptime            show system uptime
`.trim()

const NEOFETCH_ART = `
 archie@webos
 ─────────────
OS: archieOS WebEdition
Kernel: Next.js 16
Shell: TypeScript 5.7
WM: i3wm-web
Theme: Blue Frost
Terminal: web-term
Uptime: just started
`.trim()

// ── Hook ─────────────────────────────────────────────────────────────────────
export function useTerminal() {
    const [lines, setLines] = useState<TerminalLine[]>([
        { type: "system", text: "archieOS Terminal v0.1.0 — type 'help' for commands" },
        { type: "system", text: "─────────────────────────────────────────────────────" },
    ])
    const [cwd, setCwd] = useState<string[]>(["home", "archie"])
    const [cmdHistory, setCmdHistory] = useState<string[]>([])
    const [historyIdx, setHistoryIdx] = useState(-1)
    const [fs, setFs] = useState(INITIAL_FS)
    const startTime = useState(() => Date.now())[0]

    const push = useCallback((line: TerminalLine) => setLines((l) => [...l, line]), [])

    const run = useCallback((raw: string) => {
        const input = raw.trim()
        if (!input) return

        push({ type: "input", text: input })
        setCmdHistory((h) => [input, ...h])
        setHistoryIdx(-1)

        const [cmd, ...args] = input.split(/\s+/)
        const arg0 = args[0] ?? ""

        switch (cmd) {
            case "help":
                push({ type: "output", text: HELP_TEXT })
                break

            case "clear":
                setLines([])
                break

            case "echo":
                push({ type: "output", text: args.join(" ") })
                break

            case "date":
                push({ type: "output", text: new Date().toString() })
                break

            case "whoami":
                push({ type: "output", text: "archie" })
                break

            case "pwd":
                push({ type: "output", text: "/" + cwd.join("/") })
                break

            case "uname":
                push({ type: "output", text: "archieOS 0.1.0 webOS Next.js/TypeScript" })
                break

            case "neofetch":
                push({ type: "output", text: NEOFETCH_ART })
                break

            case "uptime": {
                const secs = Math.floor((Date.now() - startTime) / 1000)
                const mins = Math.floor(secs / 60)
                const hours = Math.floor(mins / 60)
                push({ type: "output", text: `up ${hours}h ${mins % 60}m ${secs % 60}s` })
                break
            }

            case "calc": {
                try {
                    // Safe-ish: only allow math chars
                    const expr = args.join(" ").replace(/[^0-9+\-*/().\s%]/g, "")
                    // eslint-disable-next-line no-eval
                    const result = eval(expr)
                    push({ type: "output", text: `= ${result}` })
                } catch {
                    push({ type: "error", text: "calc: invalid expression" })
                }
                break
            }

            case "ls": {
                const target = arg0 ? resolvePath(cwd, arg0) : cwd
                const node = getNode(fs, target)
                if (!node) push({ type: "error", text: `ls: ${arg0 || "."}: No such file or directory` })
                else if (node.type === "file") push({ type: "output", text: target[target.length - 1] })
                else push({ type: "output", text: Object.keys(node.children).join("  ") || "(empty)" })
                break
            }

            case "cd": {
                const target = resolvePath(cwd, arg0)
                const node = getNode(fs, target)
                if (!node || node.type !== "dir") push({ type: "error", text: `cd: ${arg0}: No such directory` })
                else setCwd(target)
                break
            }

            case "cat": {
                if (!arg0) { push({ type: "error", text: "cat: missing file name" }); break }
                const target = resolvePath(cwd, arg0)
                const node = getNode(fs, target)
                if (!node) push({ type: "error", text: `cat: ${arg0}: No such file` })
                else if (node.type === "dir") push({ type: "error", text: `cat: ${arg0}: Is a directory` })
                else push({ type: "output", text: node.content })
                break
            }

            case "mkdir": {
                if (!arg0) { push({ type: "error", text: "mkdir: missing name" }); break }
                setFs((prev) => {
                    const copy = structuredClone(prev)
                    const parent = getNode(copy, cwd) as Extract<FSNode, { type: "dir" }>
                    if (parent) parent.children[arg0] = { type: "dir", children: {} }
                    return copy
                })
                break
            }

            case "touch": {
                if (!arg0) { push({ type: "error", text: "touch: missing name" }); break }
                setFs((prev) => {
                    const copy = structuredClone(prev)
                    const parent = getNode(copy, cwd) as Extract<FSNode, { type: "dir" }>
                    if (parent && !parent.children[arg0])
                        parent.children[arg0] = { type: "file", content: "" }
                    return copy
                })
                break
            }

            case "rm": {
                if (!arg0) { push({ type: "error", text: "rm: missing name" }); break }
                setFs((prev) => {
                    const copy = structuredClone(prev)
                    const parent = getNode(copy, cwd) as Extract<FSNode, { type: "dir" }>
                    if (parent) delete parent.children[arg0]
                    return copy
                })
                push({ type: "output", text: "" })
                break
            }

            case "history":
                push({ type: "output", text: cmdHistory.map((c, i) => `  ${i + 1}  ${c}`).join("\n") || "(no history)" })
                break

            default:
                push({ type: "error", text: `command not found: ${cmd} — try 'help'` })
        }
    }, [cwd, fs, cmdHistory, startTime])

    const navigateHistory = useCallback((dir: "up" | "down"): string => {
        const newIdx = dir === "up"
            ? Math.min(historyIdx + 1, cmdHistory.length - 1)
            : Math.max(historyIdx - 1, -1)
        setHistoryIdx(newIdx)
        return newIdx === -1 ? "" : cmdHistory[newIdx]
    }, [historyIdx, cmdHistory])

    const prompt = "/" + cwd.join("/")

    return { lines, run, prompt, navigateHistory, addLine: push }
}