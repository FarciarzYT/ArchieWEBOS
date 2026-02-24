import { DraggableWindow } from "@/components/DraggableWindow"
import { WindowProps } from "@/types/window"
import {useState} from "react";
import {FaGithub} from "react-icons/fa6";



export function WelcomeWindow({ window: w, onFocus, onClose, onMinimize }: WindowProps) {
    const [visible, setVisible] = useState(true)

    if (!visible) return null

    return (
        <DraggableWindow
            id="welcome"
            title="Welcome"
            visible={w.visible && !w.minimized}
            zIndex={w.zIndex}
            defaultSize={{ width: 420, height: 320 }}
            onFocus={onFocus}
            onClose={onClose}
            onMinimize={onMinimize}
        >
            <div className="flex flex-col items-center gap-3 text-center">
                <h1 className="text-2xl font-extrabold text-blue-600">archieOS - webOS</h1>
                <p className="text-lg font-bold text-gray-800">Arch + i3wm like system</p>
                <span className="text-sm font-medium text-gray-600">Use Keyboard to explore</span>
                <span className="text-sm font-medium text-gray-600">
                    {'Press "Shift" + "H" for help'}
                </span>
                <div className="flex gap-3 mt-4 w-full justify-center px-2">
                    <a
                        href="https://github.com/FarciarzYT/ArchieWEBOS.git"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:shadow-lg"
                    >
                        Github
                        <FaGithub />
                    </a>
                    <button className="flex items-center gap-2 rounded-full border-2 border-black px-4 py-2 text-sm font-bold text-black transition hover:-translate-y-0.5 hover:bg-white/80 hover:shadow-lg cursor-pointer" onClick={() => stop()}>
                        Apps
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 3h6v6" />
                            <path d="M10 14 21 3" />
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        </svg>
                    </button>
                </div>
            </div>
        </DraggableWindow>
    )
}