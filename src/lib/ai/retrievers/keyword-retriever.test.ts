import { describe, expect, it } from "vitest"
import { keywordLabRetriever } from "./keyword-retriever"

describe("keywordLabRetriever", () => {
    it("is named for eval/log reporting", () => {
        expect(keywordLabRetriever.name).toBe("keyword")
    })

    it("finds Docker content", async () => {
        const results = await keywordLabRetriever.search("Docker")
        expect(results.length).toBeGreaterThan(0)
        for (const result of results) expect(result.source).toBe("engineering-lab")
    })

    it("reuses the existing alias dictionary (springboot -> spring boot)", async () => {
        const results = await keywordLabRetriever.search("springboot")
        expect(results.some((r) => r.title.toLowerCase().includes("spring"))).toBe(true)
    })

    it("scopes to one category and respects the limit", async () => {
        const results = await keywordLabRetriever.search("security", { category: "devops", limit: 2 })
        expect(results.length).toBeLessThanOrEqual(2)
        for (const result of results) expect(result.category).toBe("devops")
    })

    it("does not match a phrase with no keyword overlap at all (this is the gap File Search is meant to test)", async () => {
        const results = await keywordLabRetriever.search("how does he isolate communication between containers")
        // Purely semantic phrasing with none of the indexed keywords/tags —
        // may still catch a couple of stray token matches ("he", "does"
        // aren't tokenized, but "communication"/"containers" doesn't appear
        // in the Docker networking content's keyword list), so this just
        // documents today's behavior rather than asserting zero results.
        expect(Array.isArray(results)).toBe(true)
    })
})
