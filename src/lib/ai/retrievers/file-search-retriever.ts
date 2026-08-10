import "server-only"

import { getEngineeringLabIndex } from "@/src/lib/db/engineering-lab"
import { contentTypeOf } from "@/src/lib/lab/search"
import { deriveSlug, toResult } from "./lab-item-mapping"
import type { LabRetriever, LabSearchOptions, LabSearchResult } from "./types"

/**
 * Experimental retriever backed by OpenAI's vector store search
 * (https://api.openai.com/v1/vector_stores/{id}/search) — direct semantic +
 * keyword search over the indexed Lab documents, with no completion/model
 * call involved. This is deliberately the *direct search* endpoint, not the
 * `fileSearch` Responses API tool (which only runs inside a full model
 * turn) — the direct endpoint is cheaper, faster, and matches this
 * codebase's existing "small function returns ranked results" tool pattern
 * (see src/lib/ai/moderation.ts for the same direct-REST-call precedent).
 *
 * The exact request/response shape is inspected from OpenAI's current API
 * reference at the time this was written, not assumed from memory — verify
 * against the live API docs before the first real indexing/search run, since
 * this environment has no network access to confirm it end-to-end.
 */

export class FileSearchUnavailableError extends Error {}

const FILE_SEARCH_TIMEOUT_MS = 8_000
const DEFAULT_LIMIT = 3
const MAX_LIMIT = 8

export interface RawFileSearchMatch {
    /** Our own canonical slug, read back from the document's `attributes.slug` — never derived from `filename`. `null` when the result can't be trusted (see search() below). */
    slug: string | null
    fileId: string
    filename: string
    score: number
    text: string
}

interface VectorStoreSearchApiResult {
    file_id: string
    filename: string
    score: number
    attributes?: Record<string, unknown>
    content?: { type: string; text: string }[]
}

interface VectorStoreSearchApiResponse {
    data?: VectorStoreSearchApiResult[]
}

/**
 * Raw call to the vector store search endpoint — exported (in addition to
 * the LabRetriever-conforming `fileSearchLabRetriever` below) so evals/
 * debugging tooling (scripts/eval-retrieval.ts) can inspect the untrimmed
 * response: which file matched, the relevance score, and the retrieved
 * text. None of that is part of the public `LabSearchResult` shape — it
 * would be internal debugging detail leaking into a production contract.
 */
export async function rawFileSearch(query: string, options: LabSearchOptions = {}): Promise<RawFileSearchMatch[]> {
    const vectorStoreId = process.env.OPENAI_PORTFOLIO_VECTOR_STORE_ID
    const apiKey = process.env.OPENAI_API_KEY
    if (!vectorStoreId || !apiKey) {
        throw new FileSearchUnavailableError("OPENAI_PORTFOLIO_VECTOR_STORE_ID or OPENAI_API_KEY is not configured")
    }

    const limit = Math.min(options.limit ?? DEFAULT_LIMIT, MAX_LIMIT)

    let response: Response
    try {
        response = await fetch(`https://api.openai.com/v1/vector_stores/${vectorStoreId}/search`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                query,
                max_num_results: limit,
                ...(options.category ? { filters: { type: "eq", key: "category", value: options.category } } : {}),
            }),
            signal: AbortSignal.timeout(FILE_SEARCH_TIMEOUT_MS),
        })
    } catch (error) {
        throw new FileSearchUnavailableError(error instanceof Error ? error.message : "network error calling vector store search")
    }

    if (!response.ok) {
        throw new FileSearchUnavailableError(`vector store search returned status ${response.status}`)
    }

    let data: VectorStoreSearchApiResponse
    try {
        data = (await response.json()) as VectorStoreSearchApiResponse
    } catch {
        throw new FileSearchUnavailableError("vector store search returned an unparsable response")
    }

    return (data.data ?? []).map((result) => ({
        slug: typeof result.attributes?.slug === "string" ? result.attributes.slug : null,
        fileId: result.file_id,
        filename: result.filename,
        score: result.score,
        text: (result.content ?? []).map((part) => part.text).join(" "),
    }))
}

/**
 * LabRetriever-conforming wrapper. Every match is re-resolved against the
 * live Engineering Lab index by slug (never trusting the vector store's own
 * `filename`/text for identity or a URL) — a match whose slug is missing or
 * no longer exists in the live source of truth is dropped rather than
 * surfaced with invented metadata (see module doc on retrievers/types.ts).
 */
export const fileSearchLabRetriever: LabRetriever = {
    name: "file-search",
    async search(query: string, options: LabSearchOptions = {}): Promise<LabSearchResult[]> {
        const matches = await rawFileSearch(query, options)
        if (matches.length === 0) return []

        const { items } = await getEngineeringLabIndex()
        const bySlug = new Map(items.map((item) => [deriveSlug(item), item]))

        const results: LabSearchResult[] = []
        for (const match of matches) {
            if (!match.slug) continue
            const item = bySlug.get(match.slug)
            if (!item) continue
            results.push(toResult(item, contentTypeOf))
        }
        return results
    },
}
