import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { HoverArrow } from "@/src/components/lab/ui/HoverArrow"
import { Reveal } from "@/src/components/system/Reveal"
import { interactiveCard, cn } from "@/src/lib/utils/utils"

export interface AppliedProject {
    slug: string
    title: string
    description: string
    /** Short topic labels for what the project actually demonstrates (Project.engineeringFocus) — not the full tech stack. */
    conceptsDemonstrated: string[]
    category?: string
    technologies: string[]
    status: "live" | "source" | "private" | "case-study"
}

const statusConfig: Record<
    AppliedProject["status"],
    { label: string; dot: string }
> = {
    live: { label: "Live", dot: "bg-success" },
    source: { label: "Source", dot: "bg-brand" },
    private: { label: "Private", dot: "bg-warning" },
    "case-study": { label: "Case study", dot: "bg-fg-muted" },
}

/**
 * "Apply what you learn" — one or two real projects that put the paths above
 * into practice. Deliberately capped to avoid competing with the
 * learning-path actions above it for attention.
 */
export function ApplyInProjects({ projects }: { projects: AppliedProject[] }) {
    if (projects.length === 0) return null

    return (
        <section className="mb-10" aria-labelledby="apply-projects-heading">
            <div className="mb-4 flex items-center justify-between">
                <h2
                    id="apply-projects-heading"
                    className="text-xl font-bold tracking-tight text-fg"
                >
                    Apply what you learn
                </h2>
                <Link
                    href="/projects"
                    className="group flex items-center gap-1 font-mono text-sm text-fg-muted transition-colors hover:text-fg"
                >
                    all projects <HoverArrow icon={ArrowUpRight} size={12} />
                </Link>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
                {projects.map((project, i) => (
                    <Reveal key={project.slug} delay={i * 0.06}>
                        <Link
                            href={`/projects/${project.slug}`}
                            className={cn(
                                "group flex h-full flex-col rounded-2xl border border-border bg-surface p-5",
                                interactiveCard,
                            )}
                        >
                            <div className="mb-3 flex items-center justify-between gap-3">
                                <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-fg-muted">
                                    {project.category ?? "Engineering project"}
                                </span>
                                <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-medium uppercase tracking-wider text-fg-muted">
                                    <span
                                        className={`h-1.5 w-1.5 rounded-full ${statusConfig[project.status].dot}`}
                                        aria-hidden="true"
                                    />
                                    {statusConfig[project.status].label}
                                </span>
                            </div>
                            <h3 className="text-lg font-semibold text-fg">
                                {project.title}
                            </h3>
                            <p className="mb-3 line-clamp-2 text-base leading-relaxed text-fg-secondary">
                                {project.description}
                            </p>
                            <ul
                                className="mb-3 flex flex-wrap gap-1.5"
                                aria-label={`${project.title} technologies`}
                            >
                                {project.technologies
                                    .slice(0, 3)
                                    .map((tech) => (
                                        <li
                                            key={tech}
                                            className="rounded-md border border-border bg-background px-2 py-0.5 font-mono text-[10px] text-fg-muted"
                                        >
                                            {tech}
                                        </li>
                                    ))}
                            </ul>
                            {project.conceptsDemonstrated.length > 0 && (
                                <>
                                    <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-fg-muted">
                                        Concepts demonstrated
                                    </p>
                                    <p className="mt-1 line-clamp-2 text-sm leading-5 text-fg-secondary">
                                        {project.conceptsDemonstrated
                                            .slice(0, 4)
                                            .join(" · ")}
                                    </p>
                                </>
                            )}
                            <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-medium text-brand">
                                View engineering case study
                                <HoverArrow
                                    icon={ArrowUpRight}
                                    size={13}
                                    className="text-brand"
                                />
                            </span>
                        </Link>
                    </Reveal>
                ))}
            </div>
        </section>
    )
}
