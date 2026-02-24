"use client"

import { BACKGROUNDS } from "@/data/background"
import { MatrixCanvas } from "@/components/ui/MatrixCanvas"
import { WavesCanvas }  from "@/components/ui/WavesCanvas"

type Props = { backgroundId: string }

export function Background({ backgroundId }: Props) {
    const bg = BACKGROUNDS.find((b) => b.id === backgroundId) ?? BACKGROUNDS[0]

    if (bg.type === "animated") {
        if (bg.value === "matrix") return <MatrixCanvas />
        if (bg.value === "waves")  return <WavesCanvas />
    }

    return (
        <>
            <div className={`absolute inset-0 bg-gradient-to-br ${bg.value}`} />
            <div
                className="absolute inset-0 opacity-[0.06]"
                style={{
                    backgroundImage: "radial-gradient(circle, #3b82f6 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                }}
            />
        </>
    )
}