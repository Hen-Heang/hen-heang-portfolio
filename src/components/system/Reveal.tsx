"use client"

import React from "react"
import { motion } from "motion/react"
import { subtleDuration, subtleEase } from "@/src/lib/utils/animations"

interface RevealProps {
    delay?: number
    className?: string
    children: React.ReactNode
}

/**
 * Gently moves content into place as it enters the viewport. The initial
 * opacity remains high so content stays readable before hydration or if the
 * animation never runs.
 */
export function Reveal({ delay = 0, className, children }: RevealProps) {
    return (
        <motion.div
            data-motion-enter
            className={className}
            initial={{ opacity: 0.85, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-32px" }}
            transition={{
                duration: subtleDuration,
                delay,
                ease: subtleEase,
            }}
        >
            {children}
        </motion.div>
    )
}
