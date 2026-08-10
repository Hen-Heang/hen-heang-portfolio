import "server-only"

import { getEngineeringLabIndex } from "@/src/lib/db/engineering-lab"
import { rankLabSearch, contentTypeOf } from "@/src/lib/lab/search"
import { CATEGORY_BY_SOURCE, toResult } from "./lab-item-mapping"
import type { LabRetriever, LabSearchOptions, LabSearchResult } from "./types"

const DEFAULT_LIMIT = 5
const MAX_LIMIT = 8

/**
 * Today's production retriever — the exact ranked, alias-aware keyword
 * search (src/lib/lab/search.ts) that already backs the Lab's own search UI,
 * wrapped behind the `LabRetriever` interface. Behavior is unchanged from
 * before this module existed; this is a rename/relocation, not a rewrite.
 */
export const keywordLabRetriever: LabRetriever = {
    name: "keyword",
    async search(query: string, options: LabSearchOptions = {}): Promise<LabSearchResult[]> {
        const { items } = await getEngineeringLabIndex()
        const scoped = options.category ? items.filter((item) => CATEGORY_BY_SOURCE[item.source] === options.category) : items
        const limit = Math.min(options.limit ?? DEFAULT_LIMIT, MAX_LIMIT)
        return rankLabSearch(query, scoped, { limit }).map((item) => toResult(item, contentTypeOf))
    },
}
