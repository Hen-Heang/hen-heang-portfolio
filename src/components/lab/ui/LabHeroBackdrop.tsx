import type { ReactNode } from "react"

/**
 * Layered hero shell.
 *
 * The depth comes from stacking, not from a single background colour:
 *
 *   0. two rows of drifting term chips (the only moving layer)
 *   1. a feather mask on the drift wrapper, so the rows dissolve at all four
 *      edges instead of ending on a visible seam
 *   2. a flat scrim, to flatten contrast under the copy
 *   3. a radial vignette, to pull the eye to the centre
 *   4. the children, on `relative z-10`
 *
 * Layers 1–3 are what make it read as finished; the drift on its own just
 * looks busy. Everything is tokenised, so both themes are handled by the
 * `--hero-*` variables in globals.css rather than by `dark:` variants here.
 */
export function LabHeroBackdrop({
    terms,
    children,
    className = "",
}: {
    /** Decorative label text for the drifting rows. Needs ~8+ to fill a row. */
    terms: readonly string[]
    children: ReactNode
    className?: string
}) {
    // Each row renders its terms twice: the -50% drift keyframe lands exactly
    // on the boundary between the copies, so the loop has no visible jump.
    const half = Math.ceil(terms.length / 2)
    const rows = [terms.slice(0, half), terms.slice(half)]

    return (
        <section
            className={`relative isolate overflow-hidden rounded-3xl border border-border ${className}`}
        >
            <div
                aria-hidden="true"
                className="mask-feather-y pointer-events-none absolute inset-0 select-none"
            >
                <div className="mask-feather-x absolute inset-0 flex flex-col justify-center gap-4">
                    {rows.map((row, index) => (
                        <div
                            key={index}
                            className={`flex w-max gap-4 ${
                                index % 2 === 0
                                    ? "animate-drift"
                                    : "animate-drift-slow"
                            }`}
                        >
                            {[...row, ...row].map((term, position) => (
                                <span
                                    key={`${term}-${position}`}
                                    className="whitespace-nowrap rounded-xl border px-5 py-2.5 font-mono text-sm font-medium tracking-tight"
                                    style={{
                                        background: "var(--hero-tile-bg)",
                                        borderColor: "var(--hero-tile-border)",
                                        color: "var(--hero-tile-fg)",
                                    }}
                                >
                                    {term}
                                </span>
                            ))}
                        </div>
                    ))}
                </div>

                <div
                    className="absolute inset-0"
                    style={{ background: "var(--hero-scrim)" }}
                />
                <div
                    className="absolute inset-0"
                    style={{ backgroundImage: "var(--hero-vignette)" }}
                />
            </div>

            <div className="relative z-10 px-6 py-12 md:px-10 md:py-16">
                {children}
            </div>
        </section>
    )
}
