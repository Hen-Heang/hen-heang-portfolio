import { describe, expect, it } from "vitest"
import { buildCorrectionsKnowledge } from "./corrections"
import { keywordRetriever } from "@/src/lib/ai/retrieval"
import type { AIProfileFact } from "@/src/lib/types/ai-knowledge"

function fact(overrides: Partial<AIProfileFact>): AIProfileFact {
    return {
        id: "fact-1",
        category: "positioning",
        factText: "Heang now also holds an AWS certification.",
        supportingSourceId: null,
        visibility: "public",
        status: "approved",
        validFrom: null,
        validUntil: null,
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-02T00:00:00Z",
        ...overrides,
    }
}

describe("buildCorrectionsKnowledge", () => {
    it("builds a retrievable section for an approved+public fact", () => {
        const sections = buildCorrectionsKnowledge([fact({})])
        expect(sections).toHaveLength(1)
        expect(sections[0].id).toBe("correction-fact-fact-1")
        expect(sections[0].category).toBe("positioning")
        expect(sections[0].content).toBe("Heang now also holds an AWS certification.")
    })

    it("excludes a draft fact even if one is present in the input (defense-in-depth, not the real gate)", () => {
        const sections = buildCorrectionsKnowledge([fact({ id: "draft-1", status: "draft" })])
        expect(sections).toHaveLength(0)
    })

    it("excludes a rejected fact", () => {
        const sections = buildCorrectionsKnowledge([fact({ id: "rejected-1", status: "rejected" })])
        expect(sections).toHaveLength(0)
    })

    it("excludes an owner-visibility fact even when approved", () => {
        const sections = buildCorrectionsKnowledge([fact({ id: "owner-1", visibility: "owner" })])
        expect(sections).toHaveLength(0)
    })

    it("only surfaces the approved+public facts out of a mixed batch", () => {
        const sections = buildCorrectionsKnowledge([
            fact({ id: "approved-1", status: "approved", visibility: "public" }),
            fact({ id: "draft-1", status: "draft", visibility: "public" }),
            fact({ id: "owner-1", status: "approved", visibility: "owner" }),
        ])
        expect(sections.map((s) => s.id)).toEqual(["correction-fact-approved-1"])
    })

    it("produces unique, stable ids per fact", () => {
        const sections = buildCorrectionsKnowledge([fact({ id: "a" }), fact({ id: "b" })])
        expect(sections.map((s) => s.id)).toEqual(["correction-fact-a", "correction-fact-b"])
    })

    it("an approved correction is actually retrievable through the real keyword retriever for a relevant query", () => {
        const sections = buildCorrectionsKnowledge([
            fact({ id: "aws-cert", factText: "Heang earned an AWS Certified Developer certification in 2026." }),
        ])
        const result = keywordRetriever.retrieve("Does he have an AWS certification?", sections)
        expect(result.map((s) => s.id)).toContain("correction-fact-aws-cert")
    })

    it("a draft correction can never be retrieved, because it never produces a section in the first place", () => {
        const sections = buildCorrectionsKnowledge([
            fact({ id: "draft-cert", status: "draft", factText: "Heang earned an AWS Certified Developer certification." }),
        ])
        expect(sections).toHaveLength(0)
        const result = keywordRetriever.retrieve("Does he have an AWS certification?", sections)
        expect(result).toHaveLength(0)
    })
})
