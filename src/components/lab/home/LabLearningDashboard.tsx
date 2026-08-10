"use client"

import Link from "next/link"
import { ArrowRight, Braces, Sparkles, Terminal } from "lucide-react"
import type { BackendItemSummary } from "@/src/lib/types/backend-engineering"
import type { RoadmapTopic } from "@/src/lib/types/devops-lab"
import { useBackendProgress } from "@/src/components/lab/backend/BackendProgress"
import { useDevOpsProgress } from "@/src/components/lab/devops/DevOpsProgress"

const paths = {
    backend: {
        outcome: "Ship secure, observable Spring Boot services end to end.",
        technologies: ["Java", "Spring Boot", "MyBatis", "PostgreSQL"],
    },
    devops: {
        outcome: "Take a service from local code to a reachable, recoverable deployment.",
        technologies: ["Docker", "CI/CD", "Nginx", "Git"],
    },
    ai: {
        outcome: "Use AI as a careful partner across research, implementation, and review.",
        technologies: ["Claude Code", "Gemini", "Prompt Design"],
    },
}

export function LabLearningDashboard({ backendItems, devopsTopics }: { backendItems: BackendItemSummary[]; devopsTopics: RoadmapTopic[] }) {
    const backendProgress = useBackendProgress()
    const devopsProgress = useDevOpsProgress()
    const publishedBackend = backendItems.filter((item) => item.status === "published")
    const availableDevOps = devopsTopics.filter((topic) => topic.hasCard)
    const nextBackend = publishedBackend.find((item) => !backendProgress.has(item.id))
    const nextDevOps = availableDevOps.find((topic) => !devopsProgress.has(topic.slug))

    const backendDone = publishedBackend.filter((item) => backendProgress.has(item.id)).length
    const devopsDone = availableDevOps.filter((topic) => devopsProgress.has(topic.slug)).length

    return (
        <section id="learning-paths" className="mb-10 scroll-mt-24" aria-labelledby="learning-paths-heading">
            <h2 id="learning-paths-heading" className="mb-4 text-xl font-bold tracking-tight text-fg">
                Learning paths
            </h2>

            <div className="grid gap-4 lg:grid-cols-3">
                <LearningPathCard
                    icon={Braces}
                    title="Backend Engineering"
                    recommended
                    outcome={paths.backend.outcome}
                    technologies={paths.backend.technologies}
                    completed={backendDone}
                    total={publishedBackend.length}
                    href={nextBackend ? `/lab/backend/${nextBackend.slug}` : "/lab/backend/roadmap"}
                    action={nextBackend ? `Continue: ${nextBackend.title}` : "Review the roadmap"}
                    accent="brand"
                />
                <LearningPathCard
                    icon={Terminal}
                    title="DevOps for Backend"
                    outcome={paths.devops.outcome}
                    technologies={paths.devops.technologies}
                    completed={devopsDone}
                    total={availableDevOps.length}
                    href={nextDevOps ? `/lab/devops/topics/${nextDevOps.slug}` : "/lab/devops/labs"}
                    action={nextDevOps ? `Continue: ${nextDevOps.title}` : "Practice with a hands-on lab"}
                    accent="success"
                />
                <LearningPathCard
                    icon={Sparkles}
                    title="AI-Assisted Engineering"
                    outcome={paths.ai.outcome}
                    technologies={paths.ai.technologies}
                    href="/ai-engineering"
                    action="Start with practical articles"
                    accent="warning"
                />
            </div>
        </section>
    )
}

function LearningPathCard({
    icon: Icon,
    title,
    recommended,
    outcome,
    technologies,
    completed,
    total,
    href,
    action,
    accent,
}: {
    icon: React.ComponentType<{
        size?: number
        className?: string
        "aria-hidden"?: boolean
    }>
    title: string
    recommended?: boolean
    outcome: string
    technologies: string[]
    completed?: number
    total?: number
    href: string
    action: string
    accent: "brand" | "success" | "warning"
}) {
    const accentClasses = {
        brand: "bg-brand/10 text-brand",
        success: "bg-success/10 text-success",
        warning: "bg-warning/10 text-warning",
    }[accent]
    const progress = total ? Math.round(((completed ?? 0) / total) * 100) : null

    return (
        <article className={`relative flex h-full flex-col overflow-hidden rounded-2xl border p-5 ${recommended ? "border-brand/30 bg-brand/[0.03]" : "border-border bg-surface"}`}>
            <Icon size={92} className="pointer-events-none absolute -right-5 -top-5 text-fg/[0.035]" aria-hidden={true} />
            <div className="flex items-start justify-between gap-3">
                <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${accentClasses}`}>
                    <Icon size={22} aria-hidden={true} />
                </span>
                {recommended && <span className="rounded-full bg-brand/10 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-brand">Recommended</span>}
            </div>
            <h3 className="mt-4 text-xl font-bold text-fg">{title}</h3>
            <p className="mt-1.5 text-base leading-6 text-fg-secondary">{outcome}</p>

            <div className="mt-3 flex flex-wrap gap-1.5">
                {technologies.slice(0, 4).map((tech) => (
                    <span key={tech} className="rounded-md border border-border bg-background px-2 py-0.5 font-mono text-[11px] text-fg-muted">
                        {tech}
                    </span>
                ))}
            </div>

            {progress !== null && (
                <div className="mt-4">
                    <div className="mb-1.5 flex items-center justify-between font-mono text-[11px] text-fg-muted">
                        <span>
                            {completed}/{total} complete
                        </span>
                        <span>{progress}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-surface-elevated">
                        <div className="h-full rounded-full bg-brand transition-[width]" style={{ width: `${progress}%` }} />
                    </div>
                </div>
            )}

            <Link
                href={href}
                className="group mt-5 flex min-h-11 items-center justify-between gap-3 rounded-xl border border-border bg-background px-3.5 py-2.5 text-base font-semibold text-fg transition-colors hover:border-border-strong"
            >
                <span className="line-clamp-1">{action}</span>
                <ArrowRight size={14} className="shrink-0 text-fg-muted transition-transform group-hover:translate-x-1 group-hover:text-brand" aria-hidden="true" />
            </Link>
        </article>
    )
}
