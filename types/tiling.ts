export type Rect = {
    x: number
    y: number
    width: number
    height: number
}

export type LeafNode = {
    type: "leaf"
    windowId: string
}

export type SplitNode = {
    type: "split"
    direction: "horizontal" | "vertical"
    children: LayoutNode[]
    ratios: number[]   // one per child, must sum to 1
}

export type LayoutNode = LeafNode | SplitNode

export type TilingLayout = {
    root: LayoutNode | null
    focused: string | null
    floating: string[]        // window IDs in floating mode
    fullscreen: string | null // window ID in fullscreen
}

export type SplitDirection = "horizontal" | "vertical"

// ── Workspace types ──────────────────────────────────────────────────────────

export type Workspace = {
    id: number                // 1–10 (10 displayed as 0)
    name: string              // "1", "2", ... "10"
    layout: TilingLayout
}

export type WorkspaceState = {
    workspaces: Workspace[]
    activeId: number          // which workspace is currently visible
}