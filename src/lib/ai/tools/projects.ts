import "server-only"

import { z } from "zod"
import { tool } from "ai"

import { getProjectBySlug } from "../portfolio-knowledge"
import { rankSections } from "../retrieval"
import { projectsKnowledge } from "@/data/knowledge/projects"
import { withTiming, type ToolLogger } from "./logging"
import type { Project } from "@/src/lib/types"

function projectSummary(project: Project) {
    return {
        slug: project.slug,
        title: project.title,
        description: project.description,
        technologies: project.technologies,
        ownership: project.ownership ?? null,
        featured: project.featured ?? false,
        url: `https://henheang.site/projects/${project.slug}`,
    }
}

export function createProjectTools(logger: ToolLogger) {
    const searchProjects = tool({
        description:
            "Search Heang's projects by project name, technology, skill, or engineering focus area (e.g. \"Spring Boot\", \"authentication\", \"H-Phsar\"). Use for \"which project(s) use/show X\" or \"where did he use X\". Returns a few compact summaries — call getProject for one project's full detail.",
        inputSchema: z.object({
            query: z.string().min(1).describe("A project name, technology, skill, or engineering focus area to search for."),
        }),
        // Reuses the same scored-ranking primitive that grounds the system prompt's
        // KNOWLEDGE block (rankSections, src/lib/ai/retrieval.ts), scoped to the
        // projects knowledge sections — one matching implementation, not a second
        // one duplicated inside this tool. Deliberately not keywordRetriever.retrieve
        // itself: that wrapper adds core-section injection and the system prompt's
        // own character budget, neither of which belongs to a search tool that just
        // wants the top few matching projects.
        execute: withTiming("searchProjects", logger, async ({ query }: { query: string }) => {
            const ranked = rankSections(query, projectsKnowledge, { limit: 5 })
            const slugs = ranked.map((section) => section.projectSlug).filter((slug): slug is string => Boolean(slug))
            const projects = slugs.map(getProjectBySlug).filter((project): project is Project => Boolean(project))
            return { projects: projects.map(projectSummary) }
        }),
    })

    const getProject = tool({
        description: "Full case-study detail for one project by slug (get the slug from searchProjects first). Use when the visitor names a specific project.",
        inputSchema: z.object({
            slug: z.string().min(1).describe("The project's slug, e.g. \"h-phsar\"."),
        }),
        execute: withTiming("getProject", logger, async ({ slug }: { slug: string }) => {
            const project = getProjectBySlug(slug)
            if (!project) return { error: `No project found with slug "${slug}".` }

            return {
                slug: project.slug,
                title: project.title,
                description: project.description,
                businessProblem: project.businessProblem ?? null,
                overview: project.overview ?? null,
                engineeringFocus: project.engineeringFocus ?? [],
                technologies: project.technologies,
                skills: project.skills ?? [],
                features: project.features?.slice(0, 5) ?? [],
                technicalDetails: project.technicalDetails ?? null,
                challenges: project.challenges?.slice(0, 3) ?? [],
                solutions: project.solutions?.slice(0, 3) ?? [],
                role: project.role ?? null,
                duration: project.duration ?? null,
                confidential: project.confidential ?? false,
                github: project.confidential ? null : (project.github ?? null),
                demo: project.confidential ? null : (project.demo && project.demo !== "#" ? project.demo : null),
                url: `https://henheang.site/projects/${project.slug}`,
            }
        }),
    })

    return { searchProjects, getProject }
}
