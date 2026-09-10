"use client"

import { useSyncExternalStore, type ReactNode } from "react"
import { motion, useReducedMotion } from "motion/react"
import { subtleDuration, subtleEase } from "@/src/lib/utils/animations"

const subscribeToHydration = () => () => undefined

/**
 * Fades a section up as it scrolls into view.
 *
 * The resting state is the *visible* one, and the animation is opt-in after
 * mount. That ordering matters: rendering the hidden state on the server
 * means any path where the reveal never completes — reduced-motion users,
 * a missed IntersectionObserver, JS failing outright — leaves the content
 * permanently dimmed and offset. Gating on `mounted` costs one extra client
 * render and makes "stuck invisible" unreachable.
 *
 * `opacity` starts at 0.6 rather than 0 for the same reason: even mid-flight
 * the text stays readable to someone scrolling fast.
 */
export function Reveal({
    children,
    delay = 0,
    className = "",
}: {
    children: ReactNode
    /** Seconds. Use small increments (~0.06) to stagger siblings. */
    delay?: number
    className?: string
}) {
    const reduced = useReducedMotion()
    const mounted = useSyncExternalStore(
        subscribeToHydration,
        () => true,
        () => false,
    )

    if (!mounted || reduced) {
        return <div className={className}>{children}</div>
    }

    return (
        <motion.div
            className={className}
            initial={{ opacity: 0.6, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -12% 0px" }}
            transition={{ duration: subtleDuration, ease: subtleEase, delay }}
        >
            {children}
        </motion.div>
    )
}
