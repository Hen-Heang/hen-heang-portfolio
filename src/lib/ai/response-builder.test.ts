import { describe, expect, it } from "vitest"

import { buildPortfolioMeta, type ToolCallRecord } from "./response-builder"
import { MAX_EVIDENCE_ITEMS, MAX_SKILL_CHIPS, MAX_SUGGESTED_QUESTIONS } from "./response-schema"

describe("buildPortfolioMeta", () => {
    it("returns an all-empty payload when no tools were called", () => {
        const meta = buildPortfolioMeta([])
        expect(meta).toEqual({ evidence: [], skills: [], suggestedQuestions: [] })
    })

    it("ignores tool results from an unrecognized tool name", () => {
        const meta = buildPortfolioMeta([{ toolName: "somethingElse", output: { foo: "bar" } }])
        expect(meta).toEqual({ evidence: [], skills: [], suggestedQuestions: [] })
    })

    it("maps searchProjects results to project evidence with a trusted internal href", () => {
        const toolResults: ToolCallRecord[] = [
            {
                toolName: "searchProjects",
                output: {
                    projects: [
                        { slug: "h-phsar", title: "H-Phsar — B2B Marketplace API", description: "A marketplace API.", ownership: "Personal Project" },
                    ],
                },
            },
        ]
        const meta = buildPortfolioMeta(toolResults)
        expect(meta.evidence).toEqual([
            { type: "project", title: "H-Phsar — B2B Marketplace API", description: "A marketplace API.", href: "/projects/h-phsar", evidenceLevel: "project" },
        ])
    })

    it("marks a professional-work project as professional-level evidence, not project-level", () => {
        const toolResults: ToolCallRecord[] = [
            { toolName: "getProject", output: { slug: "work-thing", title: "Work Thing", description: "Company work.", ownership: "Professional Work" } },
        ]
        const meta = buildPortfolioMeta(toolResults)
        expect(meta.evidence[0].evidenceLevel).toBe("professional")
    })

    it("maps getExperience results to professional evidence linking to /about, never inventing a URL", () => {
        const toolResults: ToolCallRecord[] = [
            { toolName: "getExperience", output: { experience: [{ role: "Backend Developer", company: "Bizplay", summary: "Builds backend systems." }] } },
        ]
        const meta = buildPortfolioMeta(toolResults)
        expect(meta.evidence).toEqual([
            { type: "experience", title: "Backend Developer · Bizplay", description: "Builds backend systems.", href: "/about", evidenceLevel: "professional" },
        ])
    })

    it("preserves skill status exactly as returned by getSkills — never upgrades learning to primary", () => {
        const toolResults: ToolCallRecord[] = [
            { toolName: "getSkills", output: { skills: [{ name: "Kubernetes", status: "learning" }, { name: "Spring Boot", status: "primary" }] } },
        ]
        const meta = buildPortfolioMeta(toolResults)
        const kubernetes = meta.skills.find((s) => s.name === "Kubernetes")
        expect(kubernetes?.status).toBe("learning")
    })

    it("links a backend Lab result to its own detail page", () => {
        const toolResults: ToolCallRecord[] = [
            {
                toolName: "searchEngineeringLab",
                output: { results: [{ slug: "spring-boot-layered-architecture", title: "Spring Boot Layered Architecture", summary: "How the layers fit.", category: "backend", type: "guide" }] },
            },
        ]
        const meta = buildPortfolioMeta(toolResults)
        expect(meta.evidence[0]).toMatchObject({ type: "lab", href: "/lab/backend/spring-boot-layered-architecture", evidenceLevel: "demonstrated" })
    })

    it("links a DevOps lab-type result to /lab/devops/labs and a guide-type result to /lab/devops/topics", () => {
        const toolResults: ToolCallRecord[] = [
            { toolName: "searchEngineeringLab", output: { results: [{ slug: "docker-compose-lab", title: "Docker Compose Lab", summary: "Hands-on.", category: "devops", type: "lab" }] } },
        ]
        const meta = buildPortfolioMeta(toolResults)
        expect(meta.evidence[0].href).toBe("/lab/devops/labs/docker-compose-lab")

        const toolResults2: ToolCallRecord[] = [
            { toolName: "getLabItem", output: { slug: "docker", title: "Docker", summary: "Overview.", category: "devops", type: "guide" } },
        ]
        const meta2 = buildPortfolioMeta(toolResults2)
        expect(meta2.evidence[0].href).toBe("/lab/devops/topics/docker")
    })

    it("links an AI Engineering article to its detail page but falls back to the section index for non-article content", () => {
        const article: ToolCallRecord = {
            toolName: "searchEngineeringLab",
            output: { results: [{ slug: "ai-workflow", title: "AI Workflow", summary: "Article.", category: "ai", type: "article" }] },
        }
        expect(buildPortfolioMeta([article]).evidence[0].href).toBe("/ai-engineering/articles/ai-workflow")

        const prompt: ToolCallRecord = {
            toolName: "searchEngineeringLab",
            output: { results: [{ slug: "n-a", title: "A Prompt", summary: "Prompt.", category: "ai", type: "prompt" }] },
        }
        expect(buildPortfolioMeta([prompt]).evidence[0].href).toBe("/ai-engineering")
    })

    it("drops a getProject/getLabItem error result instead of inventing evidence", () => {
        const toolResults: ToolCallRecord[] = [
            { toolName: "getProject", output: { error: "No project found" } },
            { toolName: "getLabItem", output: { error: "No item found" } },
        ]
        expect(buildPortfolioMeta(toolResults).evidence).toEqual([])
    })

    it("caps evidence and ranks professional above project above demonstrated above learning", () => {
        const toolResults: ToolCallRecord[] = [
            { toolName: "searchEngineeringLab", output: { results: [{ slug: "a", title: "Lab A", summary: "x", category: "backend", type: "guide" }] } },
            { toolName: "searchProjects", output: { projects: [{ slug: "p1", title: "Project One", description: "x", ownership: "Personal Project" }] } },
            { toolName: "getExperience", output: { experience: [{ role: "Dev", company: "Acme", summary: "x" }] } },
            { toolName: "getProject", output: { slug: "p2", title: "Project Two", description: "x", ownership: "Personal Project" } },
        ]
        const meta = buildPortfolioMeta(toolResults)
        expect(meta.evidence.length).toBeLessThanOrEqual(MAX_EVIDENCE_ITEMS)
        expect(meta.evidence[0].evidenceLevel).toBe("professional")
        expect(meta.evidence.map((e) => e.evidenceLevel)).not.toContain("demonstrated")
    })

    it("dedupes evidence with the same href and caps skills, sorted primary first", () => {
        const toolResults: ToolCallRecord[] = [
            { toolName: "searchProjects", output: { projects: [{ slug: "p1", title: "Project One", description: "x", ownership: "Personal Project" }] } },
            { toolName: "getProject", output: { slug: "p1", title: "Project One", description: "fuller description", ownership: "Personal Project" } },
            {
                toolName: "getSkills",
                output: {
                    skills: [
                        { name: "Kubernetes", status: "learning" },
                        { name: "Java", status: "primary" },
                        { name: "Spring Boot", status: "primary" },
                        { name: "MyBatis", status: "primary" },
                        { name: "PostgreSQL", status: "primary" },
                        { name: "Oracle", status: "primary" },
                        { name: "React", status: "working-knowledge" },
                    ],
                },
            },
        ]
        const meta = buildPortfolioMeta(toolResults)
        expect(meta.evidence).toHaveLength(1)
        expect(meta.skills.length).toBeLessThanOrEqual(MAX_SKILL_CHIPS)
        expect(meta.skills[0].status).toBe("primary")
        expect(meta.skills.some((s) => s.name === "Kubernetes")).toBe(false)
    })

    it("builds portfolio-scoped suggested questions grounded in the evidence actually shown, capped at the limit", () => {
        const toolResults: ToolCallRecord[] = [
            { toolName: "searchProjects", output: { projects: [{ slug: "h-phsar", title: "H-Phsar — B2B Marketplace API", description: "x", ownership: "Personal Project" }] } },
            { toolName: "getSkills", output: { skills: [{ name: "Spring Boot", status: "primary" }] } },
        ]
        const meta = buildPortfolioMeta(toolResults)
        expect(meta.suggestedQuestions.length).toBeGreaterThan(0)
        expect(meta.suggestedQuestions.length).toBeLessThanOrEqual(MAX_SUGGESTED_QUESTIONS)
        expect(meta.suggestedQuestions.some((q) => q.includes("H-Phsar"))).toBe(true)
        for (const question of meta.suggestedQuestions) {
            expect(question.toLowerCase()).not.toContain("joke")
            expect(question.toLowerCase()).not.toContain("weather")
        }
    })

    it("returns no suggested questions when nothing grounds them (e.g. a plain contact answer)", () => {
        const meta = buildPortfolioMeta([])
        expect(meta.suggestedQuestions).toEqual([])
    })
})
