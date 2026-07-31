import { describe, expect, it } from "vitest"
import { aiEngineeringKnowledge, buildAIEngineeringKnowledge } from "./ai-engineering"
import type { AICategory, Article, Prompt, Snippet } from "@/src/lib/types/ai-engineering"

const category: AICategory = {
    slug: "code-review",
    title: "Code Review",
    emoji: "🔍",
    icon: "Search",
    description: "Prompts and articles for reviewing code with AI.",
}

const article: Article = {
    slug: "grounded-retrieval",
    title: "Grounded retrieval for a portfolio assistant",
    description: "How the assistant answers only from real portfolio data.",
    category: "code-review",
    tags: ["retrieval", "openai"],
    technologies: ["TypeScript", "OpenAI Responses API"],
    publishedAt: "2026-01-01",
    readingTime: 6,
    difficulty: "intermediate",
    author: "Hen Heang",
    coverEmoji: "🧠",
    body: [{ type: "paragraph", text: "This body content should never be sent to the model." }],
}

const prompt: Prompt = {
    id: "backend-endpoint-review",
    title: "Review a REST endpoint for edge cases",
    category: "code-review",
    description: "Surfaces missing validation and error handling.",
    prompt: "Review this endpoint...",
    expectedOutput: "A list of gaps.",
    bestPractices: ["Ask for concrete inputs"],
    tags: ["rest", "review"],
}

const snippet: Snippet = {
    id: "retry-with-backoff",
    title: "Retry with exponential backoff",
    language: "TypeScript",
    code: "export async function retry() { /* ... */ }",
    tags: ["resilience"],
    explanation: "Retries a failing call with exponential backoff and jitter.",
}

const emptyData = { categories: [], articles: [], prompts: [], snippets: [] }

describe("buildAIEngineeringKnowledge", () => {
    it("always includes the two verified narrative sections", () => {
        const sections = buildAIEngineeringKnowledge(emptyData)
        const ids = sections.map((s) => s.id)
        expect(ids).toContain("ai-application-integration")
        expect(ids).toContain("ai-assisted-development")
    })

    it("omits the catalog and per-item sections when Supabase has no rows, instead of rendering an empty list", () => {
        const sections = buildAIEngineeringKnowledge(emptyData)
        expect(sections).toHaveLength(2)
        expect(sections.some((s) => s.id === "ai-engineering-catalog")).toBe(false)
    })

    it("builds one compact section per article — not the full ContentBlock body", () => {
        const sections = buildAIEngineeringKnowledge({ ...emptyData, articles: [article] })
        const section = sections.find((s) => s.id === `ai-article-${article.slug}`)
        expect(section).toBeDefined()
        expect(section?.content).toContain(article.title)
        expect(section?.content).toContain(article.description)
        expect(section?.sourceUrl).toBe(`https://henheang.site/ai-engineering/articles/${article.slug}`)
        expect(section?.keywords).toContain("retrieval")
        // The compact summary must never include the raw structured body.
        expect(section?.content).not.toContain("This body content should never be sent to the model.")
    })

    it("builds one compact section per prompt, including the prompt text", () => {
        const sections = buildAIEngineeringKnowledge({ ...emptyData, prompts: [prompt] })
        const section = sections.find((s) => s.id === `ai-prompt-${prompt.id}`)
        expect(section).toBeDefined()
        expect(section?.content).toContain(prompt.title)
        expect(section?.content).toContain(prompt.prompt)
        expect(section?.content).toContain(prompt.category)
    })

    it("builds one compact section per snippet, with the explanation but not the raw code", () => {
        const sections = buildAIEngineeringKnowledge({ ...emptyData, snippets: [snippet] })
        const section = sections.find((s) => s.id === `ai-snippet-${snippet.id}`)
        expect(section).toBeDefined()
        expect(section?.content).toContain(snippet.explanation)
        expect(section?.content).toContain(snippet.language)
        expect(section?.content).not.toContain(snippet.code)
    })

    it("builds a catalog section summarizing categories and counts, not the full item list", () => {
        const sections = buildAIEngineeringKnowledge({ categories: [category], articles: [article], prompts: [prompt], snippets: [snippet] })
        const catalog = sections.find((s) => s.id === "ai-engineering-catalog")
        expect(catalog).toBeDefined()
        expect(catalog?.content).toContain(category.title)
        expect(catalog?.content).toContain("1 article")
        expect(catalog?.content).toContain("1 prompt")
    })

    it("the static fallback export never claims live-only article/prompt/snippet content", () => {
        const ids = aiEngineeringKnowledge.map((s) => s.id)
        expect(ids).not.toContain("ai-engineering-catalog")
        expect(ids.some((id) => id.startsWith("ai-article-"))).toBe(false)
        expect(ids.some((id) => id.startsWith("ai-prompt-"))).toBe(false)
        expect(ids.some((id) => id.startsWith("ai-snippet-"))).toBe(false)
    })
})
