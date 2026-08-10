import "server-only"

import type { LabRetriever, LabSearchOptions, LabSearchResult } from "./types"

/**
 * Prefers `primary` (intended to be the semantic retriever) and falls back
 * to `fallback` (intended to be keyword) when the primary throws — e.g.
 * `FileSearchUnavailableError` for a missing vector store, a timeout, or a
 * non-OK response — or when it genuinely finds nothing, since a confident
 * "no results" from an experimental retriever shouldn't be trusted over a
 * working fallback that might still find something.
 *
 * Named "hybrid" as a query-time reliability strategy, not a merge of both
 * result sets — combining the two per-question is deliberately out of scope
 * for a first version (see the task's "don't over-engineer" guidance).
 */
export function createHybridLabRetriever(primary: LabRetriever, fallback: LabRetriever): LabRetriever {
    return {
        name: "hybrid",
        async search(query: string, options?: LabSearchOptions): Promise<LabSearchResult[]> {
            try {
                const results = await primary.search(query, options)
                if (results.length > 0) return results
            } catch {
                // Primary unavailable — fall through below rather than surface the error.
            }
            return fallback.search(query, options)
        },
    }
}
