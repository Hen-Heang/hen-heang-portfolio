import type { EngineeringLabSearchItem } from "@/src/lib/types/engineering-lab"

/**
 * Alias / synonym dictionary for Lab search — keys are lowercase tokens as
 * they come out of `tokenize()`; values are extra terms to search alongside
 * the original token. Additive only — never replaces the user's own words.
 */
export const LAB_SEARCH_ALIASES: Record<string, string[]> = {
    jwt: ["authentication", "spring security"],
    springboot: ["spring boot"],
    postgres: ["postgresql"],
    postgre: ["postgresql"],
    db: ["database"],
    api: ["rest api"],
    cicd: ["ci/cd"],
    dockerize: ["docker"],
    auth: ["security"],
    ai: ["ai-assisted engineering"],
}

/** Unicode-aware tokenizer — keeps letters/marks/numbers together (so non-Latin text doesn't fragment) plus `+ # .` for tech terms like C++, C#, Node.js. */
const tokenize = (text: string): string[] =>
    expandWithAliases(
        text
            .normalize("NFC")
            .toLowerCase()
            .split(/[^\p{L}\p{M}\p{N}+#.]+/u)
            .map((token) => token.replace(/^\.+|\.+$/g, ""))
            .filter((token) => token.length > 1),
    )

function expandWithAliases(tokens: string[]): string[] {
    const expanded = new Set(tokens)
    for (const token of tokens) {
        if (Object.prototype.hasOwnProperty.call(LAB_SEARCH_ALIASES, token)) {
            const mapped = LAB_SEARCH_ALIASES[token]
            for (const term of mapped) expanded.add(term)
        }
    }
    return [...expanded]
}

/**
 * Scores a single item against the (already tokenized+alias-expanded) query.
 * Weighting, highest first: exact title match, title token match, exact tag
 * match, partial tag match, description match, source/type match.
 */
function scoreItem(item: EngineeringLabSearchItem, rawQuery: string, queryTokens: string[]): number {
    let score = 0
    const titleLower = item.title.toLowerCase()

    if (titleLower === rawQuery) score += 20
    else if (titleLower.includes(rawQuery) && rawQuery.length > 2) score += 8

    const titleTokens = tokenize(item.title)
    const tagsLower = item.tags.map((tag) => tag.toLowerCase())
    const descriptionLower = item.description.toLowerCase()

    for (const token of queryTokens) {
        if (titleTokens.includes(token)) score += 6
        if (tagsLower.includes(token)) score += 5
        else if (tagsLower.some((tag) => tag.includes(token))) score += 2
        if (descriptionLower.includes(token)) score += 1
        if (item.source.toLowerCase().includes(token)) score += 1
        if (item.type.toLowerCase().includes(token)) score += 1
    }

    return score
}

export type LabContentType = "guide" | "lab" | "command" | "prompt" | "snippet" | "reference"

export const LAB_CONTENT_TYPES: { value: LabContentType; label: string }[] = [
    { value: "guide", label: "Guides" },
    { value: "lab", label: "Labs" },
    { value: "command", label: "Commands" },
    { value: "prompt", label: "Prompts" },
    { value: "snippet", label: "Snippets" },
    { value: "reference", label: "Reference" },
]

/** Normalizes the many raw `type` strings in the index (guide/Article/Topic/Lab/Command/Prompt/Snippet/Infrastructure/Planned …) into the small set of tabs the library page actually shows. */
export function contentTypeOf(item: EngineeringLabSearchItem): LabContentType {
    const type = item.type.toLowerCase()
    if (type.includes("lab")) return "lab"
    if (type.includes("command")) return "command"
    if (type.includes("prompt")) return "prompt"
    if (type.includes("snippet")) return "snippet"
    if (type.includes("infrastructure") || type.includes("checklist") || type.includes("interview") || type.includes("planned")) return "reference"
    return "guide"
}

export interface RankSearchOptions {
    source?: EngineeringLabSearchItem["source"]
    contentType?: LabContentType
    difficulty?: EngineeringLabSearchItem["difficulty"]
    limit?: number
}

/** Ranked local search over the Lab-wide index — replaces naive substring-only matching. */
export function rankLabSearch(query: string, items: EngineeringLabSearchItem[], options: RankSearchOptions = {}): EngineeringLabSearchItem[] {
    const filtered = items.filter((item) => {
        if (options.source && item.source !== options.source) return false
        if (options.contentType && contentTypeOf(item) !== options.contentType) return false
        if (options.difficulty && item.difficulty !== options.difficulty) return false
        return true
    })

    const rawQuery = query.trim().toLowerCase()
    if (!rawQuery) return filtered.slice(0, options.limit ?? filtered.length)

    const queryTokens = tokenize(rawQuery)
    return filtered
        .map((item) => ({ item, score: scoreItem(item, rawQuery, queryTokens) }))
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, options.limit ?? 50)
        .map((entry) => entry.item)
}
