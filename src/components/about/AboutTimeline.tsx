import React from "react"
import { Section } from "@/src/components/system/Section"
import { Timeline } from "@/src/components/system/Timeline"
import { buildCareerTimeline } from "@/src/lib/utils/timeline"
import type { EducationItem, ExperienceItem } from "@/src/lib/types"
import type { Achievement } from "@/data/achievements"

export function AboutTimeline({
    experience,
    education,
    achievements = [],
}: {
    experience: ExperienceItem[]
    education: EducationItem[]
    achievements?: Achievement[]
}) {
    const items = buildCareerTimeline(experience, education, achievements)

    return (
        <Section
            id="experience"
            eyebrow="Career Timeline"
            title="Experience, education & milestones"
            description="One chronological journey through schools, training programs, companies, awards, and certifications—from Cambodia to Korea. Credentials appear under the institution that awarded them."
            className="bg-surface"
            layout="split"
        >
            <Timeline items={items} />
        </Section>
    )
}
