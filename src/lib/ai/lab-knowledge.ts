import "server-only"

import { getEngineeringLabIndex } from "@/src/lib/db/engineering-lab"
import { getAIArticles } from "@/src/lib/db/ai-engineering"
import { contentTypeOf } from "@/src/lib/lab/search"
import { backendItems } from "@/data/lab/backend"
import { getActiveLabRetriever } from "./retrievers"
import { CATEGORY_BY_SOURCE, backendToResult, getLabItemDetail, toResult } from "./retrievers/lab-item-mapping"
import type { LabCategory, LabKnowledgeResult, LabItemDetail } from "./retrievers/types"

export type { LabCategory, LabKnowledgeResult, LabItemDetail } from "./retrievers/types"

/**
 * Searchable Engineering Lab knowledge service for the AI assistant.
 *
 * `searchLabContent` no longer hardcodes an implementation — it delegates to
 * `getActiveLabRetriever()` (src/lib/ai/retrievers/), selected by the
 * `AI_LAB_RETRIEVER` env var (keyword by default). Everything else here
 * (category/technology listing, recently-learned ranking, single-item
 * detail) is a direct, deterministic lookup over the same Engineering Lab
 * index/catalog the site itself renders from — not a "search," so it isn't
 * part of the retriever experiment.
 */

export interface SearchLabOptions {
    category?: LabCategory
    limit?: number
}

export async function searchLabContent(query: string, options: SearchLabOptions = {}): Promise<LabKnowledgeResult[]> {
    return getActiveLabRetriever().search(query, options)
}

const DEFAULT_LIMIT = 5
const MAX_LIMIT = 8

export async function getLabItemsByCategory(category: LabCategory, limit = DEFAULT_LIMIT): Promise<LabKnowledgeResult[]> {
    const { items } = await getEngineeringLabIndex()
    return items
        .filter((item) => CATEGORY_BY_SOURCE[item.source] === category)
        .slice(0, Math.min(limit, MAX_LIMIT))
        .map((item) => toResult(item, contentTypeOf))
}

/** A technology name is itself a fine search query — this is a thin, named wrapper over the active retriever rather than a second matching implementation. */
export async function getLabItemsByTechnology(technology: string, limit = DEFAULT_LIMIT): Promise<LabKnowledgeResult[]> {
    return searchLabContent(technology, { limit })
}

/**
 * Most recently published/updated Lab write-ups — the closest honest signal
 * to "what Hen has recently learned and documented." Only Backend
 * Engineering items and AI Engineering articles carry a real date; DevOps
 * Basics topics/labs don't, so they're not part of this ranking.
 */
export async function getRecentlyLearnedTopics(limit = DEFAULT_LIMIT): Promise<LabKnowledgeResult[]> {
    const articles = await getAIArticles()
    const dated = [
        ...backendItems
            .filter((item) => item.status === "published")
            .map((item) => ({ date: item.updatedAt, item: backendToResult(item) })),
        ...articles.map((article) => ({
            date: article.updatedAt ?? article.publishedAt,
            item: {
                slug: article.slug,
                title: article.title,
                category: "ai" as const,
                type: "guide",
                summary: article.description,
                technologies: article.technologies,
                difficulty: article.difficulty,
                source: "engineering-lab" as const,
            },
        })),
    ]

    return dated
        .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
        .slice(0, Math.min(limit, MAX_LIMIT))
        .map((entry) => entry.item)
}

/** Full detail for one Lab item by slug — see retrievers/lab-item-mapping.ts for how each content system is resolved. */
export async function getLabItem(slug: string): Promise<LabItemDetail | { error: string }> {
    return getLabItemDetail(slug)
}
