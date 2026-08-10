"use client"

import Link from "next/link"
import { motion } from "motion/react"
import type { BackendItemSummary } from "@/src/lib/types/backend-engineering"
import type { RoadmapTopic } from "@/src/lib/types/devops-lab"
import { useBackendProgress } from "@/src/components/lab/backend/BackendProgress"
import { useDevOpsProgress } from "@/src/components/lab/devops/DevOpsProgress"
import { useLabLearningState } from "@/src/lib/lab/learning-state"
import { HoverArrow } from "@/src/components/lab/ui/HoverArrow"
import { subtleDuration, subtleEase } from "@/src/lib/utils/animations"

/** Compact homepage summary — the full breakdown lives at /lab/progress. Factual only, no fabricated streaks/XP. */
export function ProgressSummary({
    backendItems,
    devopsTopics,
}: {
    backendItems: BackendItemSummary[]
    devopsTopics: RoadmapTopic[]
}) {
    const backendProgress = useBackendProgress()
    const devopsProgress = useDevOpsProgress()
    const state = useLabLearningState()

    const publishedBackend = backendItems.filter(
        (item) => item.status === "published",
    )
    const availableDevOps = devopsTopics.filter((topic) => topic.hasCard)
    const backendDone = publishedBackend.filter((item) =>
        backendProgress.has(item.id),
    ).length
    const devopsDone = availableDevOps.filter((topic) =>
        devopsProgress.has(topic.slug),
    ).length

    return (
        <motion.section
            initial={{ opacity: 0.85, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-32px" }}
            transition={{ duration: subtleDuration, ease: subtleEase }}
            className="group mb-2 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-5 py-4"
            aria-labelledby="progress-summary-heading"
        >
            <div>
                <h2
                    id="progress-summary-heading"
                    className="font-mono text-[11px] font-semibold uppercase tracking-wider text-fg-muted"
                >
                    Your progress
                </h2>
                <p className="mt-1 text-base text-fg-secondary">
                    Backend {backendDone}/{publishedBackend.length} · DevOps{" "}
                    {devopsDone}/{availableDevOps.length}
                    {state.savedItemIds.length > 0
                        ? ` · ${state.savedItemIds.length} saved`
                        : ""}
                </p>
            </div>
            <Link
                href="/lab/progress"
                className="inline-flex min-h-10 items-center gap-1.5 text-base font-semibold text-brand"
            >
                View full progress <HoverArrow />
            </Link>
        </motion.section>
    )
}
