import { describe, expect, it } from "vitest"
import { axConcepts, axLabs, axRoadmap, axWorkflow } from "."
import { rankLabSearch } from "@/src/lib/lab/search"
import type { EngineeringLabSearchItem } from "@/src/lib/types/engineering-lab"

describe("AX Engineering curriculum", () => {
    it("keeps the required 00–17 module sequence with unique anchors", () => {
        expect(axRoadmap).toHaveLength(18)
        expect(axRoadmap.map((module) => module.number)).toEqual(
            Array.from({ length: 18 }, (_, index) =>
                String(index).padStart(2, "0"),
            ),
        )
        expect(new Set(axRoadmap.map((module) => module.slug)).size).toBe(
            axRoadmap.length,
        )
    })

    it("labels every module as learning, experimenting, or planned", () => {
        expect(
            axRoadmap.every((module) =>
                ["learning", "experimenting", "planned"].includes(
                    module.status,
                ),
            ),
        ).toBe(true)
        expect(axRoadmap.some((module) => module.status === "planned")).toBe(
            true,
        )
    })

    it("defines the complete concept, workflow, and educational lab sets", () => {
        expect(axConcepts.map((concept) => concept.name)).toEqual(
            expect.arrayContaining([
                "Context",
                "MCP",
                "Quality Gates",
                "Evals",
                "Handoff",
            ]),
        )
        expect(axConcepts).toHaveLength(16)
        expect(axWorkflow).toHaveLength(15)
        expect(axLabs.map((lab) => lab.id)).toEqual(
            Array.from(
                { length: 11 },
                (_, index) => `LAB-${String(index + 1).padStart(2, "0")}`,
            ),
        )
        expect(axLabs.every((lab) => lab.status === "planned")).toBe(true)
    })

    it("is discoverable through the existing ranked Lab search", () => {
        const items: EngineeringLabSearchItem[] = axConcepts.map((concept) => ({
            title: concept.name,
            description: `${concept.what} ${concept.why}`,
            href: `/lab/ax-engineering#concept-${concept.slug}`,
            source: "AX Engineering",
            type: "Concept",
            tags: [concept.analogy, concept.group],
        }))

        for (const query of [
            "agent harness",
            "MCP",
            "subagent",
            "quality gate",
            "eval",
            "context engineering",
            "handoff",
            "guardrail",
        ]) {
            const curriculumItems =
                query === "agent harness" || query === "context engineering"
                    ? [
                          ...items,
                          ...axRoadmap.map(
                              (module): EngineeringLabSearchItem => ({
                                  title: module.title,
                                  description: module.description,
                                  href: `/lab/ax-engineering#module-${module.slug}`,
                                  source: "AX Engineering",
                                  type: "Learning module",
                                  tags: module.concepts,
                              }),
                          ),
                      ]
                    : items
            expect(
                rankLabSearch(query, curriculumItems).length,
                `expected a result for ${query}`,
            ).toBeGreaterThan(0)
        }
    })
})
