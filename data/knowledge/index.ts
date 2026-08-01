import { buildProfileKnowledge, profileKnowledge } from "./profile"
import { buildPositioningKnowledge, positioningKnowledge } from "./positioning"
import { buildExperienceKnowledge, experienceKnowledge } from "./experience"
import { buildCareerKnowledge, careerKnowledge } from "./career"
import { buildProjectsKnowledge, projectsKnowledge } from "./projects"
import { buildSkillsKnowledge } from "./skills"
import { buildAIEngineeringKnowledge, aiEngineeringKnowledge } from "./ai-engineering"
import { articlesKnowledge } from "./articles"
import { buildContactKnowledge, contactKnowledge } from "./contact"
import { faqKnowledge } from "./faq"
import { buildCorrectionsKnowledge } from "./corrections"
import { skills as staticSkills } from "@/data/skills"
import type { EducationItem, ExperienceItem, Project, SkillCategory } from "@/src/lib/types"
import type { AICategory, Article, Prompt, Snippet } from "@/src/lib/types/ai-engineering"
import type { AIProfileFact } from "@/src/lib/types/ai-knowledge"
import type { ProfileContentParsed } from "@/src/lib/schemas/content"
import type { KnowledgeSection } from "./types"

export type { KnowledgeSection, KnowledgeCategory } from "./types"

/** Removes duplicate/equivalent sections: exact `id` collisions first, then sections whose rendered content is identical after whitespace normalization (keeps the first occurrence of each). Exported for direct unit testing. */
export function dedupeKnowledgeSections(sections: KnowledgeSection[]): KnowledgeSection[] {
    const seenIds = new Set<string>()
    const seenContent = new Set<string>()
    const deduped: KnowledgeSection[] = []

    for (const section of sections) {
        if (seenIds.has(section.id)) continue

        const normalizedContent = section.content.trim().replace(/\s+/g, " ")
        if (normalizedContent !== "" && seenContent.has(normalizedContent)) continue

        seenIds.add(section.id)
        if (normalizedContent !== "") seenContent.add(normalizedContent)
        deduped.push(section)
    }

    return deduped
}

/**
 * Assembles a knowledge base from the given portfolio data. The live
 * knowledge layer calls this with Supabase rows/profile so the assistant
 * never drifts from what visitors and admins actually see. `experience`,
 * `education`, `projects`, `skills`, `profile`, and the AI Engineering
 * catalog (`aiContent`) all have a Supabase source with a static fallback;
 * `positioning`, `career`, `contact`, the Engineering Lab overview
 * (`articlesKnowledge`), and `faq` are synthesized narrative with no
 * database counterpart, but are still built from the live `profile` so they
 * never cite a stale name/title/company after an admin edit. `correctionFacts`
 * is the owner-approved-corrections pipeline (see
 * app/api/assistant-feedback/review/route.ts and data/knowledge/corrections.ts)
 * — visitor-submitted corrections that only ever reach here after an owner
 * explicitly approves them; drafts are never fetched into this array at all.
 */
export function buildKnowledgeBase(data: {
    profile: ProfileContentParsed
    projects: Project[]
    experiences: ExperienceItem[]
    education: EducationItem[]
    skills: SkillCategory[]
    aiContent: {
        categories: AICategory[]
        articles: Article[]
        prompts: Prompt[]
        snippets: Snippet[]
    }
    correctionFacts: AIProfileFact[]
}): KnowledgeSection[] {
    return dedupeKnowledgeSections([
        ...buildProfileKnowledge(data.profile),
        ...buildPositioningKnowledge(data.profile),
        ...buildExperienceKnowledge(data.experiences, data.education),
        ...buildCareerKnowledge(data.profile),
        ...buildProjectsKnowledge(data.projects),
        ...buildSkillsKnowledge(data.skills),
        ...buildAIEngineeringKnowledge(data.aiContent),
        ...articlesKnowledge,
        ...buildContactKnowledge(data.profile),
        ...faqKnowledge,
        ...buildCorrectionsKnowledge(data.correctionFacts),
    ])
}

/** The complete, ordered knowledge base built from the static data files — used as the total-failure fallback. */
export const knowledgeBase: KnowledgeSection[] = dedupeKnowledgeSections([
    ...profileKnowledge,
    ...positioningKnowledge,
    ...experienceKnowledge,
    ...careerKnowledge,
    ...projectsKnowledge,
    ...buildSkillsKnowledge(staticSkills),
    ...aiEngineeringKnowledge,
    ...articlesKnowledge,
    ...contactKnowledge,
    ...faqKnowledge,
])

/** Sections that are always sent regardless of the question. */
export const coreSections = knowledgeBase.filter((s) => s.core)

/** Renders a set of sections as one markdown context block for the model, appending a source link line when the section has one. */
export function renderSections(sections: KnowledgeSection[]): string {
    return sections
        .map((section) => {
            const source = section.sourceUrl ? `\n\n(Source: ${section.sourceLabel ?? section.title} — ${section.sourceUrl})` : ""
            return `## ${section.title}\n\n${section.content}${source}`
        })
        .join("\n\n---\n\n")
}
