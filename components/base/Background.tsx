export function Background() {
    return (
        <>
            {/* Sky gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-sky-200 via-blue-100 to-indigo-200" />

            {/* Dot pattern overlay */}
            <div
                className="absolute inset-0 opacity-[0.08]"
                style={{
                    backgroundImage: "radial-gradient(circle, #3b82f6 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                }}
            />
        </>
    )
}