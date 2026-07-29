import React from "react"
import { Section } from "@/src/components/system/Section"
import { ProjectFeature } from "@/src/components/system/ProjectFeature"
import { ProjectCard } from "@/src/components/projects/ProjectCard"
import { Reveal } from "@/src/components/system/Reveal"
import { TextLink } from "@/src/components/system/TextLink"
import type { Project } from "@/src/lib/types"

/**
 * One flagship backend case study plus two smaller supporting projects —
 * backend work stays prioritized without making the homepage as long as
 * two full-size panels. The full catalog lives on /projects.
 */
export function SelectedWork({ projects }: { projects: Project[] }) {
    const backend = projects.filter((project) =>
        project.technologies.some((technology) => /java|spring boot/i.test(technology))
    )
    const featured = projects.filter((p) => p.featured)
    const ordered = [...backend.filter((p) => p.featured), ...backend, ...featured, ...projects]
    const selected = ordered.filter((project, index) =>
        ordered.findIndex((candidate) => candidate.slug === project.slug) === index
    ).slice(0, 3)

    if (selected.length === 0) return null

    const [flagship, ...supporting] = selected

    return (
        <Section
            id="work"
            eyebrow="Selected Work"
            title="Backend systems, explained end to end"
            description="Not just screenshots: each case study opens the API contract, architecture, data model, security decisions, and trade-offs behind the product."
            revealHeader
        >
            <Reveal delay={0.05}>
                <ProjectFeature project={flagship} />
            </Reveal>

            {supporting.length > 0 && (
                <div className="mt-16 grid gap-6 md:grid-cols-2">
                    {supporting.map((project, index) => (
                        <Reveal key={project.slug} delay={index * 0.06} className="h-full">
                            <ProjectCard project={project} />
                        </Reveal>
                    ))}
                </div>
            )}

            <div className="mt-16">
                <TextLink href="/projects">Browse all projects</TextLink>
            </div>
        </Section>
    )
}
