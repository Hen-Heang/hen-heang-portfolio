import type { AIProfileFact } from "@/src/lib/types/ai-knowledge"
import type { KnowledgeSection } from "./types"

/** Tokenizes fact text into retrieval keywords — same rough shape as retrieval.ts's tokenizer, kept independent so this module has no dependency on it. */
function extractKeywords(text: string): string[] {
    return Array.from(new Set(text.toLowerCase().match(/\p{L}[\p{L}\p{N}-]{2,}/gu) ?? []))
}

/**
 * Owner-approved visitor corrections, promoted to knowledge by
 * app/api/assistant-feedback/review/route.ts (draft corrections never reach
 * this function at all — only rows getApprovedProfileFacts() returns do,
 * and that query only ever runs through the public anon client, which RLS
 * already restricts to approved+public+currently-valid rows).
 *
 * The `status`/`visibility` filter below is a second, defense-in-depth
 * check — belt-and-suspenders in case a caller ever passes this function an
 * unfiltered list. It is not the real gate; Postgres RLS is.
 */
export function buildCorrectionsKnowledge(facts: AIProfileFact[]): KnowledgeSection[] {
    return facts
        .filter((fact) => fact.status === "approved" && fact.visibility === "public")
        .map((fact) => ({
            id: `correction-fact-${fact.id}`,
            category: fact.category,
            title: "Owner-approved correction",
            keywords: [fact.category, ...extractKeywords(fact.factText)],
            updatedAt: fact.updatedAt,
            content: fact.factText,
        }))
}
