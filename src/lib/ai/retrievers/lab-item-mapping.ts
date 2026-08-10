import "server-only"

import { getBackendItemBySlug, getBackendSummaries } from "@/src/lib/backend/catalog"
import { getRoadmapTopic } from "@/data/lab/devops/roadmap"
import { getLearningCard } from "@/data/lab/devops/topics"
import { labs as devopsLabs } from "@/data/lab/devops/labs"
import { getAIArticleBySlug } from "@/src/lib/db/ai-engineering"
import type { EngineeringLabSearchItem } from "@/src/lib/types/engineering-lab"
import type { BackendBlock, BackendKnowledgeItem, BackendSection } from "@/src/lib/types/backend-engineering"
import type { ContentBlock } from "@/src/lib/types/ai-engineering"

/**
 * Shared "Lab item -> structured representation" toolkit. Used by:
 * - lab-knowledge.ts (getLabItem, category/technology listing)
 * - retrievers/keyword-retriever.ts (search, today's implementation)
 * - retrievers/lab-documents.ts (turning published content into File Search
 *   documents for the experimental retriever)
 *
 * Kept as one module (rather than duplicated per caller) specifically so
 * "how do we turn a Lab item into text/metadata" has one definition —
 * duplicating it per retriever would be exactly the kind of second content
 * system this whole module set is trying to avoid.
 */

export type LabCategory = "backend" | "devops" | "ai"

export interface LabKnowledgeResult {
    slug: string
    title: string
    category: LabCategory
    type: string
    summary: string
    technologies: string[]
    difficulty?: "beginner" | "intermediate" | "advanced"
    /** "planned" for Backend Engineering Lab roadmap items with no published write-up yet; omitted where the concept doesn't apply. */
    status?: "published" | "planned"
    source: "engineering-lab"
}

export interface LabItemDetail extends LabKnowledgeResult {
    /** A bounded plain-text excerpt of the item's actual content — never the full nested article. */
    excerpt: string
}

export const CATEGORY_BY_SOURCE: Record<EngineeringLabSearchItem["source"], LabCategory> = {
    "Backend Engineering": "backend",
    "DevOps Basics": "devops",
    "AI Engineering": "ai",
}

export const DEFAULT_EXCERPT_CHARS = 700

export function truncate(text: string, max = DEFAULT_EXCERPT_CHARS): string {
    const trimmed = text.trim()
    return trimmed.length > max ? `${trimmed.slice(0, max).trim()}…` : trimmed
}

export function slugify(text: string): string {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
}

let backendSlugByTitle: Map<string, { slug: string; status: string }> | null = null

/** Backend items keep their real slug even when planned (planned items share one "roadmap" href in the generic index), so this looks the slug up directly instead of parsing the href. */
export function backendSlugFor(title: string): { slug: string; status: string } | undefined {
    if (!backendSlugByTitle) {
        backendSlugByTitle = new Map(getBackendSummaries().map((item) => [item.title, { slug: item.slug, status: item.status }]))
    }
    return backendSlugByTitle.get(title)
}

/** Only Backend Engineering, DevOps topics/labs, and AI Engineering articles have an individually addressable slug/detail page — prompts, snippets, commands, and infrastructure terms don't. */
export function deriveSlug(item: EngineeringLabSearchItem): string {
    if (item.source === "Backend Engineering") return backendSlugFor(item.title)?.slug ?? slugify(item.title)
    const match = item.href.match(/\/(topics|labs|articles)\/([a-z0-9-]+)$/)
    return match ? match[2] : slugify(item.title)
}

export function toResult(item: EngineeringLabSearchItem, contentTypeOf: (item: EngineeringLabSearchItem) => string): LabKnowledgeResult {
    const backend = item.source === "Backend Engineering" ? backendSlugFor(item.title) : undefined
    return {
        slug: deriveSlug(item),
        title: item.title,
        category: CATEGORY_BY_SOURCE[item.source],
        type: contentTypeOf(item),
        summary: item.description,
        technologies: item.tags,
        difficulty: item.difficulty,
        status: backend?.status === "planned" ? "planned" : backend?.status === "published" ? "published" : undefined,
        source: "engineering-lab",
    }
}

export function backendToResult(item: BackendKnowledgeItem): LabKnowledgeResult {
    return {
        slug: item.slug,
        title: item.title,
        category: "backend",
        type: item.type,
        summary: item.description,
        technologies: item.technologies,
        difficulty: item.difficulty,
        status: item.status,
        source: "engineering-lab",
    }
}

// --- Full-content text extraction (bounded — never a whole raw article) ----

function backendBlockText(block: BackendBlock): string {
    switch (block.type) {
        case "paragraph": return block.text
        case "list": return block.items.join("; ")
        case "callout": return block.text
        case "diagram": return block.textAlternative
        case "steps": return block.items.map((step) => step.text).join("; ")
        default: return ""
    }
}

function backendSectionText(sections: BackendSection[], id: string): string {
    return (sections.find((section) => section.id === id)?.blocks ?? []).map(backendBlockText).filter(Boolean).join(" ")
}

/** `maxChars` defaults to the small tool-response budget; the indexing script (retrievers/lab-documents.ts) passes a larger budget since a File Search document should carry more material than a chat tool result. */
export function excerptFromBackendItem(item: BackendKnowledgeItem, maxChars = DEFAULT_EXCERPT_CHARS): string {
    if (item.status === "planned") {
        return truncate(
            [item.description, item.learningObjectives.length ? `Learning objectives: ${item.learningObjectives.join("; ")}.` : ""]
                .filter(Boolean)
                .join(" "),
            maxChars,
        )
    }

    switch (item.type) {
        case "lab": {
            const overview = item.overview.flatMap((section) => section.blocks).map(backendBlockText).filter(Boolean).join(" ")
            const milestones = item.milestones.map((m) => `${m.title}: ${m.goal}`).join(" ")
            return truncate([overview, milestones].filter(Boolean).join(" "), maxChars)
        }
        case "checklist": {
            const groups = item.groups.map((g) => `${g.title} — ${g.rationale}`).join(" ")
            return truncate([item.introduction, groups ? `Covers: ${groups}` : ""].filter(Boolean).join(" "), maxChars)
        }
        case "interview": {
            const questions = item.questions.map((q) => q.question).join(" · ")
            return truncate([item.introduction, questions ? `Sample questions: ${questions}` : ""].filter(Boolean).join(" "), maxChars)
        }
        default: {
            const sectionIds = ["what-it-is", "why-it-matters", "how-it-works", "common-mistakes", "best-practices"]
            const text = sectionIds.map((id) => backendSectionText(item.sections, id)).filter(Boolean).join(" ")
            return truncate(text, maxChars)
        }
    }
}

function articleBlockText(block: ContentBlock): string {
    switch (block.type) {
        case "paragraph": return block.text
        case "list": return block.items.join("; ")
        case "callout": return block.text
        case "quote": return block.text
        case "timeline": return block.steps.map((step) => step.text).join("; ")
        default: return ""
    }
}

export function articleExcerpt(blocks: ContentBlock[], maxChars = DEFAULT_EXCERPT_CHARS): string {
    return truncate(blocks.map(articleBlockText).filter(Boolean).join(" "), maxChars)
}

export function devopsTopicExcerpt(
    card: { overview: string; whyItMatters: string; howBackendDevsUseIt: string; commonMistakes: string[] },
    maxChars = DEFAULT_EXCERPT_CHARS,
): string {
    const excerpt = [card.overview, card.whyItMatters, card.howBackendDevsUseIt].join(" ")
        + (card.commonMistakes.length ? ` Common mistakes: ${card.commonMistakes.join(" ")}` : "")
    return truncate(excerpt, maxChars)
}

export function devopsLabExcerpt(
    lab: { description: string; steps: { title: string }[]; expectedResult: string; lessonsLearned: string[] },
    maxChars = DEFAULT_EXCERPT_CHARS,
): string {
    const steps = lab.steps.map((step) => step.title).join(", ")
    const excerpt = [lab.description, steps ? `Steps: ${steps}.` : "", lab.expectedResult, lab.lessonsLearned.join(" ")]
        .filter(Boolean)
        .join(" ")
    return truncate(excerpt, maxChars)
}

/**
 * Full detail for one Lab item, found by trying each content system in turn.
 * Only Backend Engineering, DevOps topics/labs, and AI Engineering articles
 * have individually addressable content deep enough to be worth a second
 * fetch — prompts, snippets, commands, and infrastructure terms are already
 * fully represented by their search result.
 */
export async function getLabItemDetail(slug: string): Promise<LabItemDetail | { error: string }> {
    const backendItem = getBackendItemBySlug(slug)
    if (backendItem) {
        return { ...backendToResult(backendItem), excerpt: excerptFromBackendItem(backendItem) }
    }

    const learningCard = getLearningCard(slug)
    const roadmapTopic = getRoadmapTopic(slug)
    if (learningCard && roadmapTopic) {
        return {
            slug,
            title: roadmapTopic.title,
            category: "devops",
            type: "guide",
            summary: roadmapTopic.description,
            technologies: [roadmapTopic.category],
            difficulty: roadmapTopic.difficulty,
            source: "engineering-lab",
            excerpt: devopsTopicExcerpt(learningCard),
        }
    }

    const lab = devopsLabs.find((l) => l.slug === slug)
    if (lab) {
        return {
            slug: lab.slug,
            title: lab.title,
            category: "devops",
            type: "lab",
            summary: lab.description,
            technologies: [],
            difficulty: lab.difficulty,
            source: "engineering-lab",
            excerpt: devopsLabExcerpt(lab),
        }
    }

    const article = await getAIArticleBySlug(slug)
    if (article) {
        return {
            slug: article.slug,
            title: article.title,
            category: "ai",
            type: "article",
            summary: article.description,
            technologies: article.technologies,
            difficulty: article.difficulty,
            source: "engineering-lab",
            excerpt: articleExcerpt(article.body) || article.description,
        }
    }

    return { error: `No Engineering Lab item found with slug "${slug}".` }
}
