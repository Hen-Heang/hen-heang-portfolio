"use client"

import type { ReactNode } from "react"
import { motion } from "motion/react"
import { subtleDuration, subtleEase } from "@/src/lib/utils/animations"

export type LabAccent = "brand" | "success" | "warning"

const accentText: Record<LabAccent, string> = { brand: "text-brand", success: "text-success", warning: "text-warning" }

/** Shared header shell for the Backend/DevOps/AI Engineering hubs — same typography, spacing, and max width; only the accent and copy differ. */
export function LabPathHeader({
    label,
    title,
    description,
    accent,
    children,
}: {
    label: string
    title: string
    description: string
    accent: LabAccent
    children?: ReactNode
}) {
    return (
        <motion.section
            initial={{ opacity: 0.85, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: subtleDuration, ease: subtleEase }}
            className="mb-8 border-b border-border pb-8"
        >
            <span className={`font-mono text-sm font-semibold uppercase tracking-[0.18em] ${accentText[accent]}`}>{label}</span>
            <h1 className="mt-2 max-w-2xl text-3xl font-bold tracking-tight text-fg md:text-4xl">{title}</h1>
            <p className="mt-3 max-w-xl text-base leading-6 text-fg-secondary">{description}</p>
            {children}
        </motion.section>
    )
}
