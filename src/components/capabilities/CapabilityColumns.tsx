"use client"

import { createElement, useEffect, useMemo, useRef, useState } from "react"
import { Pause, Play } from "lucide-react"
import { animate } from "motion/react"
import { CodeIcon, TechIcons } from "@/src/components/icons/TechIcons"
import type { SkillCategory } from "@/src/lib/types"

function usePrefersReducedMotion() {
    const [reduced, setReduced] = useState(false)

    useEffect(() => {
        if (typeof window.matchMedia !== "function") return
        const query = window.matchMedia("(prefers-reduced-motion: reduce)")
        const update = () => setReduced(query.matches)
        update()
        query.addEventListener("change", update)
        return () => query.removeEventListener("change", update)
    }, [])

    return reduced
}

export function CapabilityColumns({
    categories,
    aiStatement,
}: {
    categories: SkillCategory[]
    aiStatement: string
}) {
    const [autoPlay, setAutoPlay] = useState(true)
    const [interacting, setInteracting] = useState(false)
    const trackRef = useRef<HTMLDivElement>(null)
    const directionRef = useRef<1 | -1>(1)
    const reducedMotion = usePrefersReducedMotion()

    const technologies = useMemo(
        () =>
            categories.flatMap((category) =>
                category.items.map((technology) => ({
                    ...technology,
                    category: category.category,
                    icon: TechIcons[technology.name] ?? CodeIcon,
                })),
            ),
        [categories],
    )

    useEffect(() => {
        const track = trackRef.current
        if (!track || !autoPlay || interacting || reducedMotion) return

        const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth)
        if (maxScroll === 0) return

        let stopped = false
        let controls: ReturnType<typeof animate> | undefined

        const move = (direction: 1 | -1) => {
            directionRef.current = direction
            const target = direction === 1 ? maxScroll : 0
            const distance = Math.abs(target - track.scrollLeft)

            if (distance < 1) {
                move(direction === 1 ? -1 : 1)
                return
            }

            controls = animate(track.scrollLeft, target, {
                duration: Math.max(distance / 40, 0.1),
                ease: "linear",
                onUpdate: (value) => {
                    track.scrollLeft = value
                },
                onComplete: () => {
                    if (!stopped) move(direction === 1 ? -1 : 1)
                },
            })
        }

        move(directionRef.current)
        return () => {
            stopped = true
            controls?.stop()
        }
    }, [autoPlay, interacting, reducedMotion])

    if (technologies.length === 0) return null

    return (
        <div>
            <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                    <p className="text-sm text-fg-muted">
                        {technologies.length} skills across {categories.length}{" "}
                        categories
                    </p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-fg-muted">
                        Auto-scroll · Motion
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setAutoPlay((current) => !current)}
                    disabled={reducedMotion}
                    aria-label={
                        autoPlay
                            ? "Pause automatic technology scrolling"
                            : "Start automatic technology scrolling"
                    }
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-fg transition-colors hover:border-border-strong hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70 disabled:cursor-not-allowed disabled:opacity-35"
                >
                    {autoPlay ? (
                        <Pause size={16} aria-hidden />
                    ) : (
                        <Play size={16} aria-hidden />
                    )}
                </button>
            </div>

            <div
                ref={trackRef}
                role="region"
                aria-roledescription="carousel"
                aria-label="All technology icons"
                onMouseEnter={() => setInteracting(true)}
                onMouseLeave={() => setInteracting(false)}
                onPointerDown={() => setInteracting(true)}
                onPointerUp={() => setInteracting(false)}
                onPointerCancel={() => setInteracting(false)}
                onFocusCapture={() => setInteracting(true)}
                onBlurCapture={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget)) {
                        setInteracting(false)
                    }
                }}
                className="overflow-x-auto rounded-2xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                <ul className="flex w-max flex-nowrap gap-3 pb-2">
                    {technologies.map((technology) => (
                        <li
                            key={`${technology.category}-${technology.name}`}
                            className="shrink-0"
                        >
                            <span
                                role="img"
                                tabIndex={0}
                                aria-label={`${technology.name}, ${technology.category}`}
                                title={`${technology.name} — ${technology.category}`}
                                className="group flex h-[4.75rem] w-[4.75rem] items-center justify-center rounded-2xl border border-border bg-surface p-3 transition-[transform,border-color,background-color] hover:-translate-y-0.5 hover:border-border-strong hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70 motion-reduce:transform-none motion-reduce:transition-none"
                            >
                                <span
                                    className="flex h-11 w-11 items-center justify-center"
                                    aria-hidden
                                >
                                    {createElement(technology.icon)}
                                </span>
                            </span>
                        </li>
                    ))}
                </ul>
            </div>

            <p className="mt-8 border-t border-border pt-6 text-sm leading-relaxed text-fg-secondary">
                <span className="font-mono text-xs uppercase tracking-[0.15em] text-fg-muted">
                    AI
                </span>
                <span className="mt-2 block">{aiStatement}</span>
            </p>
        </div>
    )
}
