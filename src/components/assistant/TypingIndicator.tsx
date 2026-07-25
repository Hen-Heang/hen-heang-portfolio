"use client"

import { motion, useReducedMotion } from "motion/react"

/** Three pulsing dots shown while the assistant is thinking. */
export function TypingIndicator() {
    const reduceMotion = useReducedMotion()

    return (
        <div
            className="flex w-fit items-center gap-1.5 rounded-2xl rounded-bl-md border border-border bg-background/60 px-4 py-3"
            role="status"
            aria-label="Assistant is typing"
        >
            {[0, 1, 2].map((i) =>
                reduceMotion ? (
                    <span key={i} className="h-1.5 w-1.5 rounded-full bg-brand/60" />
                ) : (
                    <motion.span
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-brand"
                        animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
                    />
                ),
            )}
        </div>
    )
}
