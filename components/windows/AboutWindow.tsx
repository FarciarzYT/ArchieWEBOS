import { WindowProps } from "@/types/window"

export function AboutWindow({ window: w, onFocus, onClose, onMinimize }: WindowProps) {
    return (
        <div className="flex flex-col gap-3 p-4 h-full">
            <h2 className="text-xl font-bold text-blue-600">About archieOS</h2>
            <p className="text-sm leading-relaxed text-gray-600">
                archieOS is a browser-based operating system experience built with Next.js,
                TypeScript, and Tailwind CSS. It features a tiling window manager inspired
                by i3wm, giving you full control over your workspace layout.
            </p>
            <div className="mt-2 rounded-xl bg-blue-50 p-3 text-xs text-blue-800 font-mono space-y-0.5">
                <p>System: archieOS v0.1.0</p>
                <p>Kernel: Next.js 16</p>
                <p>Shell: TypeScript 5.7</p>
                <p>WM: i3wm-web</p>
            </div>
            <div>
                <h2 className="text-xl font-bold text-blue-600">About FarciarzYT</h2>
                <p className="text-sm leading-relaxed text-gray-600">
                    Young web developer focused on building web security learning labs.
                    Creator of ArchieOS (WebOS). Daily Linux user, mainly Arch Linux with i3wm,
                    but also working with Fedora 43 and KDE.
                </p>

                <h3 className="text-xl font-bold text-blue-600 mt-4">Hobbies</h3>
                <ol className="text-sm leading-relaxed text-gray-600 ml-4 list-disc">
                    <li>Cybersecurity</li>
                    <li>3D printing</li>
                    <li>Kickboxing</li>
                    <li>Chess</li>
                </ol>
            </div>
        </div>
    )
}