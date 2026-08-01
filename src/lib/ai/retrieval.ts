import "server-only"

import { renderSections, type KnowledgeSection } from "@/data/knowledge"
import { getLiveKnowledgeBase } from "./live-knowledge"
import { expandWithAliases } from "./aliases"
import type { PageContext } from "./page-context"

/**
 * Hybrid keyword retrieval over the knowledge base.
 *
 * The contract is intentionally the same as an embeddings retriever would
 * have — `retrieve(query, sections) → KnowledgeSection[]` — so this module
 * can be swapped for vector search later without touching the API route or
 * UI. Sections come from the live knowledge layer (Supabase with static
 * fallback), so the assistant always answers from what the site shows.
 */
export interface Retriever {
    retrieve(query: string, sections: KnowledgeSection[]): KnowledgeSection[]
}

/** Total character budget for retrieved context (~3k tokens). */
const CONTEXT_CHAR_BUDGET = 12_000
/** Maximum number of non-core sections to include. */
const MAX_SECTIONS = 6
/** Sections scoring below this fraction of the top score are dropped. */
const RELATIVE_SCORE_CUTOFF = 0.25

/**
 * Unicode-aware tokenizer. Keeps any Unicode letter, mark, or number together
 * (`\p{L}`/`\p{N}` cover Latin, Hangul, and Khmer script alike, so Korean and
 * Khmer questions don't collapse to zero tokens the way an ASCII-only split
 * would; `\p{M}` is essential for Khmer specifically — its dependent vowels
 * and the COENG subscript signs are combining *marks*, not letters, so
 * without it a Khmer word would fracture at every diacritic), plus `+ # .`
 * so tech terms like C++, C#, Next.js, and Node.js survive as single tokens
 * instead of being cut apart.
 */
const tokenize = (text: string): string[] =>
    expandWithAliases(
        text
            .normalize("NFC")
            .toLowerCase()
            .split(/[^\p{L}\p{M}\p{N}+#.]+/u)
            .map((token) => token.replace(/^\.+|\.+$/g, ""))
            .filter((token) => token.length > 1),
    )

function scoreSection(section: KnowledgeSection, queryTokens: string[]): number {
    let score = 0
    for (const token of queryTokens) {
        for (const keyword of section.keywords) {
            if (keyword === token) {
                score += 3
            } else if (keyword.includes(token) || token.includes(keyword)) {
                score += 1
            }
        }
        if (section.title.toLowerCase().includes(token)) score += 2
        if (section.category === token) score += 2
    }
    return score
}

export const keywordRetriever: Retriever = {
    retrieve(query: string, sections: KnowledgeSection[]): KnowledgeSection[] {
        const queryTokens = tokenize(query)

        const scored = sections
            .filter((section) => !section.core)
            .map((section) => ({ section, score: scoreSection(section, queryTokens) }))
            .filter((entry) => entry.score > 0)
            .sort((a, b) => b.score - a.score)

        const topScore = scored[0]?.score ?? 0
        const relevant = scored
            .filter((entry) => entry.score >= topScore * RELATIVE_SCORE_CUTOFF)
            .slice(0, MAX_SECTIONS)
            .map((entry) => entry.section)

        // Greetings / vague questions match nothing — fall back to the
        // overview sections so the model can still introduce Heang.
        const selected = relevant.length > 0
            ? relevant
            : sections.filter((s) => s.id === "projects-catalog" || s.id === "skills-primary-stack")

        // Core sections (identity + contact) are always present.
        const result = [...sections.filter((s) => s.core), ...selected]

        // Enforce the character budget, dropping the least relevant first.
        let total = 0
        return result.filter((section) => {
            total += section.content.length
            return total <= CONTEXT_CHAR_BUDGET
        })
    },
}

/** Coarse retrieval hints derived from the page the visitor is asking from. Never treated as fact — only nudges which sections get pulled in. */
const PAGE_CONTEXT_HINTS: Record<PageContext, string> = {
    home: "profile positioning overview",
    "projects-index": "projects catalog",
    "project-detail": "projects",
    experience: "resume cv experience career",
    skills: "skills capabilities stack about",
    contact: "contact email availability",
    articles: "articles engineering lab",
    other: "",
}

export interface BuildContextOptions {
    /** Coarse page-context hint — a retrieval nudge only, never trusted as fact. */
    page?: PageContext
    /** When `page` is "project-detail", pins that project's section into the result regardless of score. */
    projectSlug?: string
}

/**
 * Builds the focused context block for a chat turn.
 *
 * The query weights the latest user message most heavily, includes the prior
 * turn so short follow-ups ("tell me more") keep the topic in scope, and
 * folds in a page-context hint — without ever sending unbounded history to
 * retrieval.
 */
export async function buildContext(userMessages: string[], options: BuildContextOptions = {}): Promise<string> {
    const sections = await getLiveKnowledgeBase()
    const [latest, previous] = [...userMessages].reverse()
    const query = [latest, latest, previous, options.page ? PAGE_CONTEXT_HINTS[options.page] : ""]
        .filter(Boolean)
        .join("\n")

    const retrieved = keywordRetriever.retrieve(query, sections)

    if (options.page === "project-detail" && options.projectSlug) {
        const pinned = sections.find((s) => s.id === `project-${options.projectSlug}`)
        if (pinned && !retrieved.some((s) => s.id === pinned.id)) {
            return renderSections([...retrieved, pinned])
        }
    }

    return renderSections(retrieved)
}
