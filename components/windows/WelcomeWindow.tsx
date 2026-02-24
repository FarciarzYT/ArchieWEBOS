import { WindowProps } from "@/types/window"
import { FaGithub } from "react-icons/fa6"

export function WelcomeWindow({ window: w, onFocus, onClose, onMinimize }: WindowProps) {
    return (
        <div className="flex flex-col items-center gap-3 text-center p-4 h-full justify-center">
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
            </div>
        </div>
    )
}