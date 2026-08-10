import "server-only"

import type { LabCategory, LabKnowledgeResult } from "./lab-item-mapping"

export type { LabCategory, LabKnowledgeResult, LabItemDetail } from "./lab-item-mapping"

/** A search result is exactly the compact Lab summary shape the chat tool already returns — no retriever-specific fields leak out. */
export type LabSearchResult = LabKnowledgeResult

export interface LabSearchOptions {
    category?: LabCategory
    limit?: number
}

/**
 * The retrieval contract every Lab search implementation satisfies.
 *
 * The AI tool (src/lib/ai/tools/lab.ts) and lab-knowledge.ts's
 * `searchLabContent` only ever depend on this interface, never on a specific
 * implementation — swapping `AI_LAB_RETRIEVER` changes which class runs
 * without touching either of those call sites.
 */
export interface LabRetriever {
    /** A short, stable name for logging/eval reporting — e.g. "keyword", "file-search", "hybrid". */
    readonly name: string
    search(query: string, options?: LabSearchOptions): Promise<LabSearchResult[]>
}
