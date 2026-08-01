import { describe, expect, it } from "vitest"
import { buildProjectsKnowledge, projectsKnowledge } from "./projects"
import { projects as staticProjects } from "@/data/projects"

describe("Hengo technology accuracy", () => {
    it("never describes Hengo's backend as Spring Boot — it runs on Next.js and Supabase", () => {
        const hengoSection = projectsKnowledge.find((s) => s.id === "project-hengo")
        expect(hengoSection).toBeDefined()
        expect(hengoSection?.content).not.toContain("Spring Boot")
        expect(hengoSection?.content).toContain("Supabase")
        expect(hengoSection?.content).toContain("Next.js")
    })

    it("stays accurate even when rebuilt from a fabricated Supabase row for the same slug", () => {
        // Mirrors how buildProjectsKnowledge merges a DB row with the static case-study fields.
        const dbHengo = {
            slug: "hengo",
            title: "Hengo — AI Companion for Daily Growth",
            description: "An AI-powered Korean learning and growth platform.",
            technologies: ["Next.js 16", "React 19", "TypeScript", "Supabase", "Vercel AI SDK", "OpenAI"],
        }
        const merged = staticProjects.map((p) => (p.slug === "hengo" ? { ...p, ...dbHengo } : p))
        const sections = buildProjectsKnowledge(merged)
        const hengoSection = sections.find((s) => s.id === "project-hengo")

        expect(hengoSection?.content).not.toContain("Spring Boot")
    })
})

describe("project classification — professional work vs. personal projects vs. learning labs", () => {
    it("labels every project section with an explicit Type: line matching its ownership", () => {
        for (const project of staticProjects) {
            const section = projectsKnowledge.find((s) => s.id === `project-${project.slug}`)
            expect(section, `missing section for ${project.slug}`).toBeDefined()
            if (project.ownership) {
                expect(section?.content).toContain(`Type: ${project.ownership}`)
            }
        }
    })

    it("classifies Dev Lab as a Learning Lab, distinct from shipped personal projects", () => {
        const devLab = projectsKnowledge.find((s) => s.id === "project-dev-lab")
        const hPhsar = projectsKnowledge.find((s) => s.id === "project-h-phsar")

        expect(devLab?.content).toContain("Type: Learning Lab")
        expect(hPhsar?.content).toContain("Type: Personal Project")
    })

    it("the catalog summary carries the ownership label alongside each project", () => {
        const catalog = projectsKnowledge.find((s) => s.id === "projects-catalog")
        expect(catalog?.content).toContain("Dev Lab")
        expect(catalog?.content).toContain("(Learning Lab)")
    })
})
