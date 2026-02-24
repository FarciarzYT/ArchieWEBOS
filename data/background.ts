export type Background = {
    id: string
    label: string
    type: "gradient" | "animated"
    value: string
    preview: string   // CSS gradient string for the settings preview swatch
}

export const BACKGROUNDS: Background[] = [
    {
        id: "bluefrost",
        label: "Blue Frost",
        type: "gradient",
        value: "from-sky-200 via-blue-100 to-indigo-200",
        preview: "linear-gradient(135deg, #bae6fd, #dbeafe, #c7d2fe)",
    },
    {
        id: "sunset",
        label: "Sunset",
        type: "gradient",
        value: "from-orange-300 via-pink-200 to-purple-300",
        preview: "linear-gradient(135deg, #fdba74, #fbcfe8, #d8b4fe)",
    },
    {
        id: "forest",
        label: "Forest",
        type: "gradient",
        value: "from-green-300 via-emerald-100 to-teal-200",
        preview: "linear-gradient(135deg, #86efac, #d1fae5, #99f6e4)",
    },
    {
        id: "midnight",
        label: "Midnight",
        type: "gradient",
        value: "from-gray-900 via-slate-800 to-indigo-900",
        preview: "linear-gradient(135deg, #111827, #1e293b, #312e81)",
    },
    {
        id: "rose",
        label: "Rose Gold",
        type: "gradient",
        value: "from-rose-200 via-pink-100 to-amber-100",
        preview: "linear-gradient(135deg, #fecdd3, #fce7f3, #fef3c7)",
    },
    {
        id: "matrix",
        label: "Matrix",
        type: "animated",
        value: "matrix",
        preview: "linear-gradient(135deg, #000000, #003300)",
    },
    {
        id: "waves",
        label: "Waves",
        type: "animated",
        value: "waves",
        preview: "linear-gradient(135deg, #bfdbfe, #60a5fa, #3b82f6)",
    },
]