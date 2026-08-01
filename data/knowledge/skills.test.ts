import { describe, expect, it } from "vitest"
import {
    buildPrimaryStackSection,
    buildSkillDetailSections,
    buildSkillsKnowledge,
} from "./skills"
import { capabilityGroups, secondaryTechnologies } from "@/src/lib/content/capabilities"
import { keywordRetriever } from "@/src/lib/ai/retrieval"
import type { SkillCategory } from "@/src/lib/types"

const dbSkills: SkillCategory[] = [
    {
        category: "Backend",
        items: [
            { name: "Java", level: 4, experience: "2+ years" },
            { name: "Spring Boot", level: 4, experience: "2+ years" },
        ],
    },
    {
        category: "Frontend",
        items: [{ name: "React", level: 3, experience: "1.5 years" }],
    },
]

describe("skills knowledge grounding", () => {
    it("sends the curated primary stack, not a proficiency ranking", () => {
        const { content } = buildPrimaryStackSection()

        for (const group of capabilityGroups) {
            for (const tech of group.technologies) {
                expect(content).toContain(tech)
            }
        }
        // The labels that used to be generated from the stored 1-5 level.
        expect(content).not.toMatch(/\b(expert|advanced|intermediate|familiar)\b/i)
    })

    it("tells the model not to infer levels the portfolio doesn't claim", () => {
        const { content } = buildPrimaryStackSection()
        expect(content).toMatch(/do not infer a proficiency ranking/i)
    })

    it("names secondary technologies as project-scoped, not core skills", () => {
        const { content } = buildPrimaryStackSection()
        for (const tech of secondaryTechnologies) {
            expect(content).toContain(tech)
        }
        expect(content).toMatch(/rather than claimed as core skills/i)
    })

    it("passes through stored durations without inventing any", () => {
        const sections = buildSkillDetailSections(dbSkills)
        const backend = sections.find((s) => s.id === "skills-detail-backend")!

        expect(backend.content).toContain("Java — 2+ years")
        expect(backend.content).toContain("Spring Boot — 2+ years")
        // Nothing about React should appear in the backend section.
        expect(backend.content).not.toContain("React")
        // And no level number leaks through.
        expect(backend.content).not.toMatch(/level|[1-5]\/5/i)
    })

    it("reflects the database rows it is given rather than a fixed list", () => {
        const sections = buildSkillDetailSections(dbSkills)
        expect(sections.map((s) => s.id)).toEqual([
            "skills-detail-backend",
            "skills-detail-frontend",
        ])

        // An empty database yields no detail sections, but the curated stack
        // section still stands on its own.
        expect(buildSkillDetailSections([])).toEqual([])
        expect(buildSkillsKnowledge([])).toHaveLength(1)
    })

    it("skips a category the database returns with no rows", () => {
        const sections = buildSkillDetailSections([
            { category: "Empty", items: [] },
            ...dbSkills,
        ])
        expect(sections.map((s) => s.id)).not.toContain("skills-detail-empty")
    })
})

describe("skills retrieval", () => {
    const sections = buildSkillsKnowledge(dbSkills)

    it("retrieves the primary stack for a general stack question", () => {
        const result = keywordRetriever.retrieve("What is his tech stack?", sections)
        expect(result.map((s) => s.id)).toContain("skills-primary-stack")
    })

    it("retrieves the duration detail for a how-long question", () => {
        const result = keywordRetriever.retrieve(
            "How long has he used Spring Boot?",
            sections,
        )
        expect(result.map((s) => s.id)).toContain("skills-detail-backend")
    })

    it("falls back to the overview for an unrelated question instead of inventing a match", () => {
        const result = keywordRetriever.retrieve(
            "What is the capital of Peru?",
            sections,
        )
        // Nothing scores, so retrieval returns only the overview fallback —
        // it never pulls in an unrelated detail section that the model could
        // then mine for a confident-sounding but irrelevant answer. The
        // "only answer questions about Heang" rule in the system prompt does
        // the rest.
        expect(result.map((s) => s.id)).toEqual(["skills-primary-stack"])
        expect(result.map((s) => s.id)).not.toContain("skills-detail-backend")
    })

    it("does not let a technology named only in the detail rows imply a primary skill", () => {
        // React is a stored database row but deliberately not in the curated
        // stack, so a React question must not surface the primary-stack claim.
        const { content } = buildPrimaryStackSection()
        expect(content).not.toMatch(/^Frontend Support: .*React/m)
    })
})
