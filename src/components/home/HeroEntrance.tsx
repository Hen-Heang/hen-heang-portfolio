"use client"

import type { ReactNode } from "react"
import { motion } from "motion/react"
import { cn } from "@/src/lib/utils/utils"
import { subtleDuration, subtleEase } from "@/src/lib/utils/animations"

interface HeroEntranceProps {
    children: ReactNode
    delay?: number
    className?: string
}

/**
 * Small client boundary for the hero's initial sequence. The server-rendered
 * content starts mostly visible, so it remains readable before hydration or
 * when client-side animation is unavailable.
 */
export function HeroEntrance({
    children,
    delay = 0,
    className,
}: HeroEntranceProps) {
    return (
        <motion.div
            data-motion-enter
            className={cn(className)}
            initial={{ opacity: 0.85, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: subtleDuration, delay, ease: subtleEase }}
        >
            {children}
        </motion.div>
    )
}
