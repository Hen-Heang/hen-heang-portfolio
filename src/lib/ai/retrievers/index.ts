import "server-only"

import { keywordLabRetriever } from "./keyword-retriever"
import { fileSearchLabRetriever } from "./file-search-retriever"
import { createHybridLabRetriever } from "./hybrid-retriever"
import type { LabRetriever } from "./types"

export type { LabRetriever, LabSearchOptions, LabSearchResult, LabCategory, LabKnowledgeResult, LabItemDetail } from "./types"
export { keywordLabRetriever } from "./keyword-retriever"
export { fileSearchLabRetriever, rawFileSearch, FileSearchUnavailableError } from "./file-search-retriever"
export { createHybridLabRetriever } from "./hybrid-retriever"

export const LAB_RETRIEVER_MODES = ["keyword", "file-search", "hybrid"] as const
export type LabRetrieverMode = (typeof LAB_RETRIEVER_MODES)[number]

/** Unset or unrecognized always resolves to "keyword" — the stable, already-shipped retriever is the safe default, never the experimental one. */
export function resolveLabRetrieverMode(): LabRetrieverMode {
    const raw = process.env.AI_LAB_RETRIEVER
    return (LAB_RETRIEVER_MODES as readonly string[]).includes(raw ?? "") ? (raw as LabRetrieverMode) : "keyword"
}

/**
 * The retriever `searchLabContent` (src/lib/ai/lab-knowledge.ts) — and
 * therefore the `searchEngineeringLab` tool — actually uses this turn,
 * selected by the `AI_LAB_RETRIEVER` env var. Computed fresh on every call
 * (no module-level caching) so tests can vary the env var freely and a
 * config change never requires a process restart to take effect.
 */
export function getActiveLabRetriever(): LabRetriever {
    const mode = resolveLabRetrieverMode()
    if (mode === "file-search") return fileSearchLabRetriever
    if (mode === "hybrid") return createHybridLabRetriever(fileSearchLabRetriever, keywordLabRetriever)
    return keywordLabRetriever
}
