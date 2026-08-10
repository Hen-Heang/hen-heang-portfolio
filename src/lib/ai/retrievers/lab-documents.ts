import "server-only"

import { getPublishedBackendItems } from "@/src/lib/backend/catalog"
import { roadmap } from "@/data/lab/devops/roadmap"
import { getLearningCard } from "@/data/lab/devops/topics"
import { labs as devopsLabs } from "@/data/lab/devops/labs"
import { getAIArticles } from "@/src/lib/db/ai-engineering"
import { profileData } from "@/data/profile"
import { excerptFromBackendItem, devopsTopicExcerpt, devopsLabExcerpt, articleExcerpt } from "./lab-item-mapping"
import type { LabCategory } from "./types"

/**
 * Turns existing Engineering Lab content into documents suitable for File
 * Search indexing. This is the explicit allowlist for what may ever be
 * indexed (Step 19 of the retrieval-experiment task): it only ever reads
 * from these five named, already-public data sources — published Backend
 * Engineering Lab items, DevOps topics that have a real learning card,
 * DevOps labs, and AI Engineering articles. It never touches the
 * filesystem, never scans the repository, and never includes anything not
 * already rendered on a public /lab or /ai-engineering page.
 *
 * Deliberately excludes:
 * - Backend Engineering Lab items with `status: "planned"` — roadmap stubs
 *   with no real write-up aren't "long-form knowledge" and shouldn't be
 *   indexed as if they were something Hen has actually documented.
 * - Prompts, snippets, commands, infrastructure terms — short structured
 *   items already well served by the keyword tools; not long-form content.
 *
 * No content is duplicated by hand: every field is read directly from the
 * same source of truth the /lab and /ai-engineering pages render from.
 */

export interface LabDocument {
    slug: string
    title: string
    category: LabCategory
    contentType: string
    technologies: string[]
    topics: string[]
    status: "published"
    summary: string
    content: string
    /** Canonical portfolio URL — the ONLY URL a File Search result may ever be attributed to (see retrievers/file-search-retriever.ts, which re-resolves every match by slug rather than trusting anything File Search echoes back). */
    url: string
}

/** More generous than the ~700-char tool-response excerpt (src/lib/ai/retrievers/lab-item-mapping.ts) — a File Search document should carry enough material to be worth chunking/embedding, still far short of the full raw article. */
const INDEX_CONTENT_MAX_CHARS = 4_000

export async function buildLabDocuments(): Promise<LabDocument[]> {
    const backendDocs: LabDocument[] = getPublishedBackendItems().map((item) => ({
        slug: item.slug,
        title: item.title,
        category: "backend",
        contentType: item.type,
        technologies: item.technologies,
        topics: item.keywords,
        status: "published",
        summary: item.description,
        content: excerptFromBackendItem(item, INDEX_CONTENT_MAX_CHARS),
        url: `${profileData.portfolioUrl}/lab/backend/${item.slug}`,
    }))

    const devopsTopicDocs: LabDocument[] = roadmap
        .filter((topic) => topic.hasCard)
        .map((topic): LabDocument | null => {
            const card = getLearningCard(topic.slug)
            if (!card) return null
            return {
                slug: topic.slug,
                title: topic.title,
                category: "devops" as const,
                contentType: "guide",
                technologies: [],
                topics: [topic.category],
                status: "published" as const,
                summary: topic.description,
                content: devopsTopicExcerpt(card, INDEX_CONTENT_MAX_CHARS),
                url: `${profileData.portfolioUrl}/lab/devops/topics/${topic.slug}`,
            }
        })
        .filter((doc): doc is LabDocument => doc !== null)

    const devopsLabDocs: LabDocument[] = devopsLabs.map((lab) => ({
        slug: lab.slug,
        title: lab.title,
        category: "devops",
        contentType: "lab",
        technologies: [],
        topics: [],
        status: "published",
        summary: lab.description,
        content: devopsLabExcerpt(lab, INDEX_CONTENT_MAX_CHARS),
        url: `${profileData.portfolioUrl}/lab/devops/labs/${lab.slug}`,
    }))

    const articles = await getAIArticles()
    const articleDocs: LabDocument[] = articles.map((article) => ({
        slug: article.slug,
        title: article.title,
        category: "ai",
        contentType: "article",
        technologies: article.technologies,
        topics: article.tags,
        status: "published",
        summary: article.description,
        content: articleExcerpt(article.body, INDEX_CONTENT_MAX_CHARS) || article.description,
        url: `${profileData.portfolioUrl}/ai-engineering/articles/${article.slug}`,
    }))

    return [...backendDocs, ...devopsTopicDocs, ...devopsLabDocs, ...articleDocs]
}
