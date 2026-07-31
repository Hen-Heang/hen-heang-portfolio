import { skills as staticSkills } from "@/data/skills"
import { systemStatus, currentFocus, engineeringPhilosophy } from "@/data/lab/overview"
import type { SkillCategory } from "@/src/lib/types"
import type { KnowledgeSection } from "./types"

const levelLabel = (level: number) =>
    level >= 5 ? "expert" : level === 4 ? "advanced" : level === 3 ? "intermediate" : "familiar"

/**
 * Per-category skill sections. Exposed as a builder so the live knowledge
 * layer can rebuild them from Supabase rows; the static export below is the
 * fallback when the database is unavailable.
 */
export function buildSkillSections(skills: SkillCategory[]): KnowledgeSection[] {
    return skills.map((group) => ({
        id: `skills-${group.category.toLowerCase()}`,
        category: "skills",
        title: `${group.category} skills`,
        keywords: [
            group.category.toLowerCase(),
            "skills", "technologies", "stack", "experience", "level", "proficiency",
            ...group.items.map((item) => item.name.toLowerCase()),
        ],
        sourceLabel: "About page — skills",
        sourceUrl: "https://henheang.site/about",
        content: group.items
            .map((item) => `- ${item.name} — ${levelLabel(item.level)}${item.experience ? ` (${item.experience})` : ""}`)
            .join("\n"),
    }))
}

const skillSections: KnowledgeSection[] = buildSkillSections(staticSkills)

const focusSection: KnowledgeSection = {
    id: "skills-current-focus",
    category: "skills",
    title: "Current focus and engineering philosophy",
    keywords: [
        "focus", "learning", "currently", "now", "philosophy", "approach",
        "devops", "docker", "ci/cd", "system design",
    ],
    sourceLabel: "Engineering Lab — experiments",
    sourceUrl: "https://henheang.site/lab/experiments",
    content: [
        `Current technical focus: ${currentFocus.join(", ")}.`,
        "",
        "Active areas (from the Engineering Lab):",
        ...systemStatus.map((s) => `- ${s.area} (${s.tech}) — ${s.status}: ${s.detail}`),
        "",
        `Engineering philosophy: "${engineeringPhilosophy}"`,
    ].join("\n"),
}

export function buildSkillsKnowledge(skills: SkillCategory[]): KnowledgeSection[] {
    return [...buildSkillSections(skills), focusSection]
}

export const skillsKnowledge: KnowledgeSection[] = [...skillSections, focusSection]
