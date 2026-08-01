import { describe, expect, it } from "vitest"
import {
    MAX_TECHNOLOGIES_PER_GROUP,
    aiStatement,
    capabilityGroups,
    primaryTechnologies,
    secondaryTechnologies,
} from "./capabilities"
import { buildCapabilityEvidence, techKeys } from "./capability-evidence"
import { projects } from "@/data/projects"
import { experiences } from "@/data/experience"

describe("canonical capability model", () => {
    it("presents four groups, each within the scannable limit", () => {
        expect(capabilityGroups).toHaveLength(4)
        for (const group of capabilityGroups) {
            expect(group.technologies.length).toBeGreaterThan(0)
            expect(group.technologies.length).toBeLessThanOrEqual(
                MAX_TECHNOLOGIES_PER_GROUP,
            )
        }
    })

    it("covers exactly the intended public groups", () => {
        expect(capabilityGroups.map((g) => g.label)).toEqual([
            "Backend",
            "Data",
            "Frontend Support",
            "Delivery",
        ])
    })

    it("never shows a proficiency level, percentage, or rank label", () => {
        const text = JSON.stringify(capabilityGroups) + aiStatement
        expect(text).not.toMatch(
            /expert|advanced|intermediate|beginner|proficien/i,
        )
        expect(text).not.toMatch(/\d+\s?%/)
        // No stray 1-5 "level" scores leaking in from the database rows.
        expect(text).not.toMatch(/"level"/)
    })

    it("keeps secondary technologies out of the primary stack", () => {
        for (const tech of secondaryTechnologies) {
            expect(primaryTechnologies).not.toContain(tech)
        }
    })

    it("presents AI as a separate statement, not a skill column", () => {
        expect(capabilityGroups.map((g) => g.label)).not.toContain("AI")
        expect(aiStatement).toContain("Claude Code")
        expect(aiStatement).toContain("Codex")
        expect(aiStatement).toContain("OpenAI")
        expect(aiStatement).toContain("Gemini")
    })
})

describe("capability evidence", () => {
    const groups = buildCapabilityEvidence(projects, experiences)

    it("splits combined labels so each half can match a project stack", () => {
        expect(techKeys("Docker/GitHub Actions")).toEqual([
            "docker",
            "github actions",
        ])
        expect(techKeys("Java 17")).toEqual(["java"])
        expect(techKeys("OpenAPI/Swagger")).toEqual(["openapi", "swagger"])
    })

    it("links core backend technologies to real projects", () => {
        const backend = groups.find((g) => g.label === "Backend")!
        const springBoot = backend.technologies.find(
            (t) => t.name === "Spring Boot",
        )!
        expect(springBoot.hasEvidence).toBe(true)
        expect(springBoot.projects.map((p) => p.slug)).toContain("h-phsar")
    })

    it("never cites a hidden project as evidence", () => {
        const hidden = projects.filter((p) => p.hidden).map((p) => p.slug)
        const cited = groups.flatMap((g) =>
            g.technologies.flatMap((t) => t.projects.map((p) => p.slug)),
        )
        for (const slug of hidden) expect(cited).not.toContain(slug)
    })

    it("marks a technology without any match as having no evidence", () => {
        const [group] = buildCapabilityEvidence(
            [],
            [],
            [{ label: "Test", summary: "", technologies: ["Nonexistent Tech"] }],
        )
        expect(group.technologies[0].hasEvidence).toBe(false)
        expect(group.technologies[0].projects).toEqual([])
    })
})
