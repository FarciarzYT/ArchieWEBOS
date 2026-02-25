"use client"

import { useState, useCallback } from "react"
import { LayoutNode, LeafNode, SplitNode, Rect, TilingLayout, Workspace, WorkspaceState } from "@/types/tiling"

const TASKBAR_H = 28  // height of the bottom dock
const STATUS_BAR_H = 28  // top i3bar

// ── Tree helpers ─────────────────────────────────────────────────────────────

function findParent(
    root: LayoutNode,
    id: string,
    parent: SplitNode | null = null
): { node: LeafNode; parent: SplitNode | null; index: number } | null {
    if (root.type === "leaf") {
        return root.windowId === id ? { node: root, parent, index: 0 } : null
    }
    for (let i = 0; i < root.children.length; i++) {
        const child = root.children[i]
        if (child.type === "leaf" && child.windowId === id)
            return { node: child, parent: root, index: i }
        const found = findParent(child, id, child.type === "split" ? child : parent)
        if (found) return found
    }
    return null
}

function allLeaves(node: LayoutNode): string[] {
    if (node.type === "leaf") return [node.windowId]
    return node.children.flatMap(allLeaves)
}

/** Compute pixel rects for every leaf given a bounding rect */
export function computeRects(
    node: LayoutNode,
    rect: Rect,
    result: Map<string, Rect> = new Map()
): Map<string, Rect> {
    if (node.type === "leaf") {
        result.set(node.windowId, {
            x: Math.round(rect.x),
            y: Math.round(rect.y),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
        })
        return result
    }
    let offset = 0
    node.children.forEach((child, i) => {
        const ratio = node.ratios[i]
        const childRect: Rect =
            node.direction === "horizontal"
                ? { x: rect.x + offset, y: rect.y, width: rect.width * ratio, height: rect.height }
                : { x: rect.x, y: rect.y + offset, width: rect.width, height: rect.height * ratio }
        offset += node.direction === "horizontal" ? rect.width * ratio : rect.height * ratio
        computeRects(child, childRect, result)
    })
    return result
}

/** Remove a window from the tree, collapsing the parent if it has one child left */
function removeFromTree(root: LayoutNode, id: string): LayoutNode | null {
    if (root.type === "leaf") return root.windowId === id ? null : root

    const newChildren: LayoutNode[] = []
    const newRatios: number[] = []
    let removedRatio = 0

    for (let i = 0; i < root.children.length; i++) {
        const child = root.children[i]
        const result = removeFromTree(child, id)
        if (result) {
            newChildren.push(result)
            newRatios.push(root.ratios[i])
        } else {
            removedRatio += root.ratios[i]
        }
    }

    if (newChildren.length === 0) return null
    if (newChildren.length === 1) return newChildren[0]

    // Redistribute the removed ratio evenly among remaining children
    if (removedRatio > 0) {
        const extra = removedRatio / newChildren.length
        for (let i = 0; i < newRatios.length; i++) {
            newRatios[i] += extra
        }
    }

    return { ...root, children: newChildren, ratios: newRatios }
}

/** Find nearest window in a direction using computed rects */
function nearestInDirection(
    fromId: string,
    dir: "left" | "right" | "up" | "down",
    rects: Map<string, Rect>
): string | null {
    const from = rects.get(fromId)
    if (!from) return null
    const cx = from.x + from.width / 2
    const cy = from.y + from.height / 2

    let best: string | null = null
    let bestDist = Infinity

    rects.forEach((r, id) => {
        if (id === fromId) return
        const rcx = r.x + r.width / 2
        const rcy = r.y + r.height / 2
        const dx = rcx - cx
        const dy = rcy - cy

        const inDir =
            dir === "left" ? dx < -10 :
                dir === "right" ? dx > 10 :
                    dir === "up" ? dy < -10 :
                        dy > 10
        if (!inDir) return

        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < bestDist) { bestDist = dist; best = id }
    })
    return best
}

// ── Workspace helpers ────────────────────────────────────────────────────────

function createEmptyLayout(): TilingLayout {
    return { root: null, focused: null, floating: [], fullscreen: null }
}

function createWorkspaces(): Workspace[] {
    return Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        name: String(i + 1),
        layout: createEmptyLayout(),
    }))
}

function getActiveLayout(state: WorkspaceState): TilingLayout {
    return state.workspaces.find(w => w.id === state.activeId)!.layout
}

function updateActiveLayout(state: WorkspaceState, updater: (layout: TilingLayout) => TilingLayout): WorkspaceState {
    return {
        ...state,
        workspaces: state.workspaces.map(ws =>
            ws.id === state.activeId
                ? { ...ws, layout: updater(ws.layout) }
                : ws
        ),
    }
}

function updateWorkspaceLayout(state: WorkspaceState, wsId: number, updater: (layout: TilingLayout) => TilingLayout): WorkspaceState {
    return {
        ...state,
        workspaces: state.workspaces.map(ws =>
            ws.id === wsId
                ? { ...ws, layout: updater(ws.layout) }
                : ws
        ),
    }
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useTilingManager() {
    const [state, setState] = useState<WorkspaceState>({
        workspaces: createWorkspaces(),
        activeId: 1,
    })

    const activeLayout = getActiveLayout(state)

    // ── Tile a new window ──────────────────────────────────────────────────
    const tileWindow = useCallback((id: string, direction: "horizontal" | "vertical" = "horizontal") => {
        setState((prev) => updateActiveLayout(prev, (layout) => {
            if (layout.floating.includes(id)) return layout

            if (!layout.root) {
                return { ...layout, root: { type: "leaf", windowId: id }, focused: id }
            }

            // Check if already tiled
            if (allLeaves(layout.root).includes(id)) return layout

            const targetId = layout.focused ?? allLeaves(layout.root)[0]
            const result = findParent(layout.root, targetId)

            const newLeaf: LeafNode = { type: "leaf", windowId: id }
            const newSplit: SplitNode = {
                type: "split",
                direction,
                children: [{ type: "leaf", windowId: targetId }, newLeaf],
                ratios: [0.5, 0.5],
            }

            let newRoot: LayoutNode
            if (!result || !result.parent) {
                newRoot = newSplit
            } else {
                const parent = result.parent
                const idx = result.index
                const newChildren = [...parent.children]
                newChildren[idx] = newSplit
                newRoot = replaceNode(layout.root, parent, { ...parent, children: newChildren })!
            }

            return { ...layout, root: newRoot, focused: id }
        }))
    }, [])

    // ── Remove a window from the tile tree ────────────────────────────────
    const untileWindow = useCallback((id: string) => {
        setState((prev) => updateActiveLayout(prev, (layout) => {
            if (!layout.root) return layout
            const newRoot = removeFromTree(layout.root, id)
            let newFocused = layout.focused
            if (layout.focused === id) {
                newFocused = newRoot ? allLeaves(newRoot)[0] ?? null : null
            }
            return { ...layout, root: newRoot, focused: newFocused, floating: layout.floating.filter(f => f !== id) }
        }))
    }, [])

    // ── Focus ──────────────────────────────────────────────────────────────
    const focus = useCallback((id: string) => {
        setState((prev) => updateActiveLayout(prev, (layout) => ({ ...layout, focused: id })))
    }, [])

    // ── Focus direction ────────────────────────────────────────────────────
    const focusDirection = useCallback(
        (dir: "left" | "right" | "up" | "down", screenW: number, screenH: number) => {
            setState((prev) => updateActiveLayout(prev, (layout) => {
                if (!layout.root || !layout.focused) return layout
                const rects = computeRects(layout.root, { x: 0, y: 0, width: screenW, height: screenH })
                const target = nearestInDirection(layout.focused, dir, rects)
                return target ? { ...layout, focused: target } : layout
            }))
        },
        []
    )

    // ── Move window in direction ───────────────────────────────────────────
    const moveDirection = useCallback(
        (dir: "left" | "right" | "up" | "down", screenW: number, screenH: number) => {
            setState((prev) => updateActiveLayout(prev, (layout) => {
                if (!layout.root || !layout.focused) return layout
                const rects = computeRects(layout.root, { x: 0, y: 0, width: screenW, height: screenH })
                const target = nearestInDirection(layout.focused, dir, rects)
                if (!target || !layout.root) return layout

                const newRoot = swapLeaves(layout.root, layout.focused, target)
                return newRoot ? { ...layout, root: newRoot } : layout
            }))
        },
        []
    )

    // ── Change split direction of parent ──────────────────────────────────
    const setSplitDirection = useCallback((direction: "horizontal" | "vertical") => {
        setState((prev) => updateActiveLayout(prev, (layout) => {
            if (!layout.root || !layout.focused) return layout
            const result = findParent(layout.root, layout.focused)
            if (!result?.parent) return layout
            const newParent: SplitNode = { ...result.parent, direction }
            const newRoot = replaceNode(layout.root, result.parent, newParent)
            return newRoot ? { ...layout, root: newRoot } : layout
        }))
    }, [])

    // ── Resize (adjust ratio of focused window's slot) ────────────────────
    const resizeSlot = useCallback((delta: number) => {
        setState((prev) => updateActiveLayout(prev, (layout) => {
            if (!layout.root || !layout.focused) return layout
            const result = findParent(layout.root, layout.focused)
            if (!result?.parent) return layout
            const { parent, index } = result
            const newRatios = [...parent.ratios]
            const other = index === 0 ? 1 : index - 1

            // Clamp delta so neither slot goes below 0.1
            const clamped = Math.max(
                -newRatios[index] + 0.1,
                Math.min(delta, newRatios[other] - 0.1)
            )
            newRatios[index] += clamped
            newRatios[other] -= clamped

            const newParent = { ...parent, ratios: newRatios }
            const newRoot = replaceNode(layout.root, parent, newParent)
            return newRoot ? { ...layout, root: newRoot } : layout
        }))
    }, [])

    // ── Toggle floating ───────────────────────────────────────────────────
    const toggleFloating = useCallback((id: string) => {
        setState((prev) => updateActiveLayout(prev, (layout) => {
            const isFloating = layout.floating.includes(id)
            if (isFloating) {
                return { ...layout, floating: layout.floating.filter((f) => f !== id) }
            } else {
                const newRoot = layout.root ? removeFromTree(layout.root, id) : null
                return { ...layout, root: newRoot, floating: [...layout.floating, id] }
            }
        }))
    }, [])

    // ── Toggle fullscreen ─────────────────────────────────────────────────
    const toggleFullscreen = useCallback((id: string) => {
        setState((prev) => updateActiveLayout(prev, (layout) => ({
            ...layout,
            fullscreen: layout.fullscreen === id ? null : id,
        })))
    }, [])

    // ── Switch workspace ──────────────────────────────────────────────────
    const switchWorkspace = useCallback((wsId: number) => {
        setState((prev) => ({ ...prev, activeId: wsId }))
    }, [])

    // ── Move focused window to another workspace ──────────────────────────
    const moveToWorkspace = useCallback((windowId: string, targetWsId: number) => {
        setState((prev) => {
            if (prev.activeId === targetWsId) return prev
            const activeLayout = getActiveLayout(prev)

            // Check if window is tiled or floating
            const isTiled = activeLayout.root ? allLeaves(activeLayout.root).includes(windowId) : false
            const isFloating = activeLayout.floating.includes(windowId)
            if (!isTiled && !isFloating) return prev

            // Remove from current workspace
            let newState = updateActiveLayout(prev, (layout) => {
                let newLayout = { ...layout }
                if (isTiled && layout.root) {
                    newLayout.root = removeFromTree(layout.root, windowId)
                }
                newLayout.floating = layout.floating.filter(f => f !== windowId)
                if (layout.focused === windowId) {
                    newLayout.focused = newLayout.root ? allLeaves(newLayout.root)[0] ?? null : null
                }
                return newLayout
            })

            // Add to target workspace
            newState = updateWorkspaceLayout(newState, targetWsId, (layout) => {
                if (isFloating) {
                    return { ...layout, floating: [...layout.floating, windowId] }
                }
                // Tile into target workspace
                if (!layout.root) {
                    return { ...layout, root: { type: "leaf", windowId }, focused: windowId }
                }
                const targetId = layout.focused ?? allLeaves(layout.root)[0]
                const newSplit: SplitNode = {
                    type: "split",
                    direction: "horizontal",
                    children: [{ type: "leaf", windowId: targetId }, { type: "leaf", windowId }],
                    ratios: [0.5, 0.5],
                }
                const result = findParent(layout.root, targetId)
                let newRoot: LayoutNode
                if (!result || !result.parent) {
                    newRoot = newSplit
                } else {
                    const parent = result.parent
                    const newChildren = [...parent.children]
                    newChildren[result.index] = newSplit
                    newRoot = replaceNode(layout.root, parent, { ...parent, children: newChildren })!
                }
                return { ...layout, root: newRoot, focused: windowId }
            })

            return newState
        })
    }, [])

    // ── Get occupied workspace IDs ────────────────────────────────────────
    const occupiedWorkspaces = state.workspaces
        .filter(ws => ws.layout.root !== null || ws.layout.floating.length > 0)
        .map(ws => ws.id)

    return {
        state,
        layout: activeLayout,
        activeWorkspaceId: state.activeId,
        workspaces: state.workspaces,
        occupiedWorkspaces,
        tileWindow,
        untileWindow,
        focus,
        focusDirection,
        moveDirection,
        setSplitDirection,
        resizeSlot,
        toggleFloating,
        toggleFullscreen,
        switchWorkspace,
        moveToWorkspace,
        TASKBAR_H,
        STATUS_BAR_H,
    }
}

// ── Tree mutation helpers ─────────────────────────────────────────────────────

function replaceNode(
    root: LayoutNode,
    target: LayoutNode,
    replacement: LayoutNode
): LayoutNode | null {
    if (root === target) return replacement
    if (root.type === "leaf") return root
    const newChildren = root.children.map((c) => replaceNode(c, target, replacement)!)
    return { ...root, children: newChildren }
}

function swapLeaves(root: LayoutNode, a: string, b: string): LayoutNode | null {
    if (root.type === "leaf") {
        if (root.windowId === a) return { type: "leaf", windowId: b }
        if (root.windowId === b) return { type: "leaf", windowId: a }
        return root
    }
    return { ...root, children: root.children.map((c) => swapLeaves(c, a, b)!) }
}