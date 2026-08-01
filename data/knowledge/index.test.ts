import { describe, expect, it } from "vitest"
import { dedupeKnowledgeSections, knowledgeBase } from "./index"
import type { KnowledgeSection } from "./types"

function section(overrides: Partial<KnowledgeSection>): KnowledgeSection {
    return {
        id: "test-section",
        category: "faq",
        title: "Test section",
        keywords: [],
        content: "Some content.",
        ...overrides,
    }
}

describe("dedupeKnowledgeSections", () => {
    it("drops a later section with the same id as an earlier one, keeping the first", () => {
        const first = section({ id: "dup", content: "First version." })
        const second = section({ id: "dup", content: "Second version." })

        const result = dedupeKnowledgeSections([first, second])

        expect(result).toHaveLength(1)
        expect(result[0].content).toBe("First version.")
    })

    it("drops a later section whose content is identical to an earlier one, even under a different id", () => {
        const first = section({ id: "profile-a", content: "Hen Heang is a backend developer in Seoul." })
        const second = section({ id: "profile-b", content: "Hen Heang is a backend developer in Seoul." })

        const result = dedupeKnowledgeSections([first, second])

        expect(result).toHaveLength(1)
        expect(result[0].id).toBe("profile-a")
    })

    it("treats whitespace-only differences as the same content", () => {
        const first = section({ id: "a", content: "Line one.\n\nLine two." })
        const second = section({ id: "b", content: "Line one.   Line two." })

        const result = dedupeKnowledgeSections([first, second])

        expect(result).toHaveLength(1)
    })

    it("keeps distinct sections with different content", () => {
        const first = section({ id: "a", content: "Content A." })
        const second = section({ id: "b", content: "Content B." })

        const result = dedupeKnowledgeSections([first, second])

        expect(result).toHaveLength(2)
    })

    it("the assembled static knowledge base has no duplicate ids", () => {
        const ids = knowledgeBase.map((s) => s.id)
        expect(new Set(ids).size).toBe(ids.length)
    })
})

describe("no unverified phone information", () => {
    it("never renders a phone number or a 'Phone:' label anywhere in the knowledge base", () => {
        for (const section of knowledgeBase) {
            expect(section.content, `section ${section.id} should not have a Phone: line`).not.toMatch(/phone:/i)
            expect(section.content, `section ${section.id} should not contain a phone-shaped number`).not.toMatch(/\+82[\s-]?\d[\d\s-]{6,}/)
        }
    })
})
