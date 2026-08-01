import {
    aiStatement,
    capabilityGroups,
    secondaryTechnologies,
} from "@/src/lib/content/capabilities"
import { positioning } from "@/src/lib/content/positioning"
import type { SkillCategory } from "@/src/lib/types"
import type { KnowledgeSection } from "./types"

/**
 * Skills knowledge for the assistant, built from the canonical capability
 * model — the same list the site shows.
 *
 * Two deliberate changes from the previous version:
 * - No proficiency labels. It used to render every skill as
 *   "expert / advanced / intermediate / familiar" from the stored 1-5 level,
 *   which invited the model to make comparative depth claims the portfolio
 *   doesn't support. Levels are still stored (admin data) but are no longer
 *   sent to the model.
 * - The primary stack is a fixed short list rather than all 27 database rows,
 *   so a "what's his stack?" question gets the same answer a recruiter reads
 *   on the page.
 */

/**
 * The primary stack — one section, always the same as `capabilityGroups`.
 * Takes no arguments: this is curated content, not database content.
 */
export function buildPrimaryStackSection(): KnowledgeSection {
    return {
        id: "skills-primary-stack",
        category: "skills",
        title: "Primary technical stack",
        keywords: [
            "skills", "stack", "technologies", "tech", "capabilities", "backend",
            "data", "database", "frontend", "delivery", "devops", "tooling",
            ...capabilityGroups.flatMap((group) => [
                group.label.toLowerCase(),
                ...group.technologies.flatMap((tech) =>
                    tech.toLowerCase().split("/"),
                ),
            ]),
        ],
        sourceLabel: "About page — technical capabilities",
        sourceUrl: "https://henheang.site/about",
        content: [
            positioning.description,
            "",
            ...capabilityGroups.flatMap((group) => [
                `${group.label}: ${group.technologies.join(", ")}.`,
                `  ${group.summary}`,
            ]),
            "",
            `AI: ${aiStatement}`,
            "",
            "These are the technologies presented as his primary stack. He has",
            "also used the following in specific projects, documented on those",
            `project pages rather than claimed as core skills: ${secondaryTechnologies.join(", ")}.`,
            "",
            "Do not infer a proficiency ranking, seniority level, or years of",
            "experience for an individual technology from this list — it is not",
            "ordered by skill and carries no levels.",
        ].join("\n"),
    }
}

/**
 * Detailed per-technology experience durations, straight from the stored
 * skill rows. Kept separate from the primary stack so a general "what's his
 * stack?" question gets the short curated answer, while "how long has he used
 * Spring Boot?" can still be answered exactly. Levels are intentionally
 * dropped; only the duration the data records is passed through.
 */
export function buildSkillDetailSections(
    skills: SkillCategory[],
): KnowledgeSection[] {
    return skills
        .filter((group) => group.items.length > 0)
        .map((group) => ({
            id: `skills-detail-${group.category.toLowerCase()}`,
            category: "skills" as const,
            title: `${group.category} — experience duration`,
            keywords: [
                group.category.toLowerCase(),
                "how long", "years", "experience", "duration", "since", "when",
                ...group.items.map((item) => item.name.toLowerCase()),
            ],
            content: [
                `How long he has worked with each ${group.category.toLowerCase()} technology:`,
                ...group.items.map(
                    (item) =>
                        `- ${item.name}${item.experience ? ` — ${item.experience}` : ""}`,
                ),
            ].join("\n"),
        }))
}

export function buildSkillsKnowledge(
    skills: SkillCategory[],
): KnowledgeSection[] {
    return [buildPrimaryStackSection(), ...buildSkillDetailSections(skills)]
}
