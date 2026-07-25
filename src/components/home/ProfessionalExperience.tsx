import React from "react"
import { Section } from "@/src/components/system/Section"
import { Timeline } from "@/src/components/system/Timeline"
import { Reveal } from "@/src/components/system/Reveal"
import { TextLink } from "@/src/components/system/TextLink"
import type { ExperienceItem } from "@/src/lib/types"

/**
 * Homepage professional-experience timeline: real employment only — no
 * education, credentials, or "current direction" mixed in. The full
 * Cambodia → Korea journey (school, bootcamp, certificates) lives on /about
 * via AboutTimeline, which still uses the same underlying `experience` data.
 */
export function ProfessionalExperience({ experience }: { experience: ExperienceItem[] }) {
    const items = experience.map((job) => ({
        period: job.period,
        title: job.role,
        org: job.company,
        location: job.location,
        description: job.summary,
        highlights: job.highlights?.slice(0, 3),
        stack: job.stack?.slice(0, 5),
        kind: "work" as const,
    }))

    if (items.length === 0) return null

    return (
        <Section
            id="experience"
            eyebrow="Experience"
            title="Professional Experience"
            description="Backend and full-stack roles in Korean enterprise teams — REST APIs, database-backed business logic, and production web applications."
            className="bg-surface"
            revealHeader
        >
            <Reveal delay={0.05}>
                <Timeline items={items} />
            </Reveal>
            <div className="mt-12">
                <TextLink href="/about">See the full career journey</TextLink>
            </div>
        </Section>
    )
}
