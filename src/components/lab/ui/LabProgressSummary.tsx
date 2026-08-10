"use client"

import { motion } from "motion/react"
import type { LabAccent } from "./LabPathHeader"

const accentBar: Record<LabAccent, string> = { brand: "bg-brand", success: "bg-success", warning: "bg-warning" }

/** Compact progress bar shared across hub headers — accessible text carries the number, the bar is decorative. */
export function LabProgressSummary({
    completed,
    total,
    label = "Learning progress",
    accent,
}: {
    completed: number
    total: number
    label?: string
    accent: LabAccent
}) {
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0

    return (
        <div className="mt-6 max-w-sm">
            <div className="mb-1.5 flex items-center justify-between font-mono text-[11px] uppercase tracking-wider text-fg-muted">
                <span>{label}</span>
                <span>{completed}/{total} · {percent}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-surface-elevated">
                <motion.div
                    className={`h-full rounded-full ${accentBar[accent]}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
                />
            </div>
        </div>
    )
}
