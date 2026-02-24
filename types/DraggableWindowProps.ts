import { ReactNode } from "react"

export default interface DraggableWindowProps {
    id: string
    title?: string
    defaultPosition?: { x: number; y: number }
    defaultSize?: { width: number; height: number }
    minSize?: { width: number; height: number }
    visible?: boolean
    zIndex?: number
    resizable?: boolean
    onFocus?: (id: string) => void
    onClose?: (id: string) => void
    onMinimize?: (id: string) => void
    children?: ReactNode
}