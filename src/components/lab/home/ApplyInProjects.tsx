import Link from "next/link"
import Image from "next/image"
import { ArrowUpRight } from "lucide-react"

export interface AppliedProject {
    slug: string
    title: string
    description: string
    image: string
    imageFit?: "cover" | "contain"
    /** Short topic labels for what the project actually demonstrates (Project.engineeringFocus) — not the full tech stack. */
    conceptsDemonstrated: string[]
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
                <h2 id="apply-projects-heading" className="text-xl font-bold tracking-tight text-fg">
                    Apply what you learn
                </h2>
                <Link href="/projects" className="flex items-center gap-1 font-mono text-sm text-fg-muted transition-colors hover:text-fg">
                    all projects <ArrowUpRight size={12} aria-hidden="true" />
                </Link>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
                {projects.map((project) => (
                    <Link
                        key={project.slug}
                        href={`/projects/${project.slug}`}
                        className="group overflow-hidden rounded-2xl border border-border bg-surface transition-colors hover:border-border-strong"
                    >
                        <div className={`relative aspect-video overflow-hidden border-b border-border ${project.imageFit === "contain" ? "bg-[#000611]" : "bg-surface-elevated"}`}>
                            <Image
                                src={project.image}
                                alt={`${project.title} project preview`}
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                className={`${project.imageFit === "contain" ? "object-contain" : "object-cover"} transition-transform duration-300 group-hover:scale-[1.025] motion-reduce:transition-none motion-reduce:group-hover:scale-100`}
                            />
                            <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white backdrop-blur-sm">
                                <ArrowUpRight size={14} aria-hidden="true" />
                            </span>
                        </div>
                        <div className="p-5">
                            <h3 className="text-lg font-semibold text-fg">{project.title}</h3>
                            <p className="mt-2 line-clamp-2 text-base leading-relaxed text-fg-secondary">{project.description}</p>
                            {project.conceptsDemonstrated.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-1.5">
                                    {project.conceptsDemonstrated.slice(0, 3).map((concept) => (
                                        <span key={concept} className="rounded-md border border-border bg-background px-2 py-1 font-mono text-[10px] text-fg-muted">
                                            {concept}
                                        </span>
                                    ))}
                                </div>
                            )}
                            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand">
                                View engineering case study <ArrowUpRight size={12} aria-hidden="true" />
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    )
}
