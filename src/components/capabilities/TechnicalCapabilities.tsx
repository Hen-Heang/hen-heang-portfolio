import React from "react"
import { Section } from "@/src/components/system/Section"
import { CapabilityColumns } from "@/src/components/capabilities/CapabilityColumns"
import { aiStatement } from "@/src/lib/content/capabilities"
import { skills } from "@/data/skills"
import type { ExperienceItem, Project } from "@/src/lib/types"

/**
 * The one section that lists the primary technical stack. Used by both the
 * homepage and /about so the two pages can never drift apart — `variant`
 * only changes the surrounding band, never the content.
 *
 * The public carousel uses the complete 27-item static catalog so its count
 * and icon set stay deterministic on both the homepage and About page.
 */
export function TechnicalCapabilities({
    projects,
    experience,
    variant = "default",
}: {
    /** Verified sources for every "used in" link the section shows. */
    projects: Project[]
    experience: ExperienceItem[]
    variant?: "default" | "surface"
}) {
    void projects
    void experience

    return (
        <Section
            id="capabilities"
            eyebrow="Technical Skills"
            title="All technologies"
            description="27 skills across 4 categories, shown as a compact icon-only carousel. Hover or focus an icon to see its technology name."
            className={variant === "surface" ? "bg-surface" : undefined}
            revealHeader
        >
            <CapabilityColumns categories={skills} aiStatement={aiStatement} />
        </Section>
    )
}
