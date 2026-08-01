import React from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, ExternalLink } from "lucide-react"
import { GithubIcon } from "@/src/components/icons/social"
import { cn, interactiveCard } from "@/src/lib/utils/utils"
import type { Project } from "@/src/lib/types"

/**
 * Card for the projects index and the homepage's supporting-project slots.
 * Exactly one link covers the whole card (case study); GitHub/live are
 * separate, always-visible anchors placed outside the stretched-link overlay
 * so there is no nested-link conflict and no hover-only affordance.
 */
export function ProjectCard({ project }: { project: Project }) {
    const isLive = Boolean(project.demo && project.demo !== "#")
    const metadata = [
        project.category,
        isLive ? "Live" : "Source available",
    ].filter(Boolean)

    return (
        <div
            className={cn(
                "group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface",
                interactiveCard,
            )}
        >
            <div
                className={cn(
                    "relative aspect-[16/10] overflow-hidden border-b border-border",
                    project.imageFit === "contain"
                        ? "bg-[#000611]"
                        : "bg-background",
                )}
            >
                <Image
                    src={project.image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className={cn(
                        project.imageFit === "contain"
                            ? "object-contain"
                            : "object-cover",
                        "transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100",
                    )}
                />
            </div>

            <div className="flex flex-1 flex-col p-5">
                {metadata.length > 0 && (
                    <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-fg-muted">
                        {metadata.join(" · ")}
                    </p>
                )}

                <h3 className="mt-3 text-lg font-semibold tracking-tight text-fg">
                    <Link
                        href={`/projects/${project.slug}`}
                        className="static-link"
                    >
                        <span className="absolute inset-0" aria-hidden="true" />
                        {project.title}
                    </Link>
                </h3>

                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-fg-secondary">
                    {project.description}
                </p>

                {project.role && (
                    <p className="mt-3 text-xs text-fg-muted">
                        Role: {project.role}
                    </p>
                )}

                {project.engineeringFocus &&
                    project.engineeringFocus.length > 0 && (
                        <p className="mt-2 text-xs text-fg-muted">
                            {project.engineeringFocus.slice(0, 3).join(" · ")}
                        </p>
                    )}

                <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand transition-colors group-hover:text-brand-hover">
                    View case study
                    <ArrowRight
                        size={14}
                        aria-hidden
                        className="transition-transform group-hover:translate-x-0.5 motion-reduce:group-hover:translate-x-0"
                    />
                </span>

                <div className="flex-1" />

                <ul
                    className="mt-4 flex flex-wrap gap-1.5"
                    aria-label={`${project.title} technologies`}
                >
                    {project.technologies.slice(0, 3).map((tech) => (
                        <li
                            key={tech}
                            className="rounded-md border border-border bg-background px-2 py-0.5 font-mono text-[11px] text-fg-secondary"
                        >
                            {tech}
                        </li>
                    ))}
                </ul>

                {project.confidential && (
                    <p className="relative z-10 mt-4 text-xs italic text-fg-muted">
                        Source private — confidential professional work.
                    </p>
                )}

                {project.github && (
                    <div className="relative z-10 mt-4 flex items-center gap-4 border-t border-border pt-4">
                        <a
                            href={project.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-fg-secondary transition-colors hover:text-fg"
                            aria-label={`View ${project.title} on GitHub (opens in a new tab)`}
                        >
                            <GithubIcon size={14} brand={false} />
                            GitHub
                        </a>
                        {isLive && (
                            <a
                                href={project.demo}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-medium text-fg-secondary transition-colors hover:text-fg"
                                aria-label={`Open ${project.title} live site (opens in a new tab)`}
                            >
                                Live site
                                <ExternalLink size={12} aria-hidden />
                            </a>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
