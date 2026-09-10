"use client"

import { useRef, useSyncExternalStore } from "react"
import { flushSync } from "react-dom"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"

const emptySubscribe = () => () => {}

/**
 * `next-themes` only knows the real theme after mount (it reads
 * localStorage/media queries client-side) — rendering an icon before that
 * would flash/mismatch between server and client, so we gate on hydration
 * via useSyncExternalStore (true on client, false during SSR) instead of a
 * setState-in-effect.
 */
export function ThemeToggle({
    className = "h-9 w-9 rounded-lg",
    iconSize = 16,
}: {
    className?: string
    iconSize?: number
}) {
    const { resolvedTheme, setTheme } = useTheme()
    const hydrated = useSyncExternalStore(emptySubscribe, () => true, () => false)
    const buttonRef = useRef<HTMLButtonElement>(null)

    if (!hydrated) {
        return <div className={className} aria-hidden="true" />
    }

    const isDark = resolvedTheme === "dark"
    const next = isDark ? "light" : "dark"

    /**
     * Reveals the incoming theme as a circle growing from the button. The
     * View Transitions API snapshots both themes; globals.css cancels the
     * default cross-fade and stacks the new snapshot on top, so animating
     * its clip-path is what actually wipes the old one away.
     *
     * Falls back to a plain swap when the API is missing (Firefox/Safari at
     * time of writing) or when the visitor has asked for reduced motion.
     */
    const toggle = () => {
        const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches

        // `in` rather than a truthiness check: lib.dom types the method as
        // always present, so `!document.startViewTransition` is a type error.
        if (!("startViewTransition" in document) || prefersReducedMotion) {
            setTheme(next)
            return
        }

        const rect = buttonRef.current?.getBoundingClientRect()
        const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2
        const y = rect ? rect.top + rect.height / 2 : 0
        // Reach the furthest viewport corner, or the circle stops short of it.
        const radius = Math.hypot(
            Math.max(x, window.innerWidth - x),
            Math.max(y, window.innerHeight - y),
        )

        // flushSync forces the class swap to land inside the transition
        // callback — a normal React update is async and would be snapshotted
        // as the *old* theme, producing no visible change.
        const transition = document.startViewTransition(() => {
            flushSync(() => setTheme(next))
        })

        void transition.ready.then(() => {
            document.documentElement.animate(
                {
                    clipPath: [
                        `circle(0px at ${x}px ${y}px)`,
                        `circle(${radius}px at ${x}px ${y}px)`,
                    ],
                },
                {
                    duration: 480,
                    easing: "cubic-bezier(0.4, 0, 0.2, 1)",
                    pseudoElement: "::view-transition-new(root)",
                },
            )
        })
    }

    return (
        <button
            ref={buttonRef}
            type="button"
            onClick={toggle}
            aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
            className={`flex items-center justify-center text-fg-muted transition-colors hover:bg-surface-hover hover:text-fg ${className}`}
        >
            {isDark ? <Sun size={iconSize} /> : <Moon size={iconSize} />}
        </button>
    )
}
