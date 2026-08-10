import { describe, expect, it } from "vitest"
import { summarize, type QuestionResult } from "./eval-retrieval"

function result(overrides: Partial<QuestionResult>): QuestionResult {
    return {
        caseId: "docker-containers",
        questionType: "direct",
        retriever: "keyword",
        query: "What has Hen learned about Docker?",
        latencyMs: 10,
        hit: true,
        resultCount: 3,
        ...overrides,
    }
}

describe("summarize", () => {
    it("computes accuracy only over scored (non-null hit) results", () => {
        const results = [
            result({ retriever: "keyword", hit: true }),
            result({ retriever: "keyword", hit: false }),
            result({ retriever: "keyword", hit: null }), // no ground truth — excluded
        ]
        const summary = summarize(results, "keyword")
        expect(summary.scoredCount).toBe(2)
        expect(summary.accuracy).toBe("50%")
    })

    it("reports n/a accuracy when nothing was scorable", () => {
        const results = [result({ retriever: "keyword", hit: null })]
        expect(summarize(results, "keyword").accuracy).toBe("n/a")
    })

    it("filters by retriever name", () => {
        const results = [result({ retriever: "keyword", hit: true }), result({ retriever: "file-search", hit: false })]
        expect(summarize(results, "keyword").accuracy).toBe("100%")
        expect(summarize(results, "file-search").accuracy).toBe("0%")
    })

    it("filters by question type when given", () => {
        const results = [
            result({ retriever: "keyword", questionType: "direct", hit: true }),
            result({ retriever: "keyword", questionType: "semantic", hit: false }),
        ]
        expect(summarize(results, "keyword", "direct").accuracy).toBe("100%")
        expect(summarize(results, "keyword", "semantic").accuracy).toBe("0%")
    })

    it("counts errors separately from hit/miss", () => {
        const results = [result({ retriever: "file-search", hit: false, error: "vector store search failed" })]
        expect(summarize(results, "file-search").errors).toBe(1)
    })

    it("averages latency across scoped results", () => {
        const results = [result({ retriever: "keyword", latencyMs: 10 }), result({ retriever: "keyword", latencyMs: 30 })]
        expect(summarize(results, "keyword").avgLatencyMs).toBe(20)
    })
})
