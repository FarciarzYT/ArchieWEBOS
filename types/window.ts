export type WindowState = {
    id: string
    title: string
    visible: boolean
    minimized: boolean
    zIndex: number
}

export type WindowHandlers = {
    onFocus: (id: string) => void
    onClose: (id: string) => void
    onMinimize: (id: string) => void
}

export type WindowProps = WindowHandlers & {
    window: WindowState
}