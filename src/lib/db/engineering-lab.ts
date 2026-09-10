import { getAIArticles, getAIPrompts, getAISnippets } from "@/src/lib/db/ai-engineering"
import { roadmap } from "@/data/lab/devops/roadmap"
import { labs } from "@/data/lab/devops/labs"
import { commandCategories } from "@/data/lab/devops/commands"
import { infraTerms } from "@/data/lab/devops/infrastructure"
import type { EngineeringLabSearchItem } from "@/src/lib/types/engineering-lab"
import { getBackendSummaries } from "@/src/lib/backend/catalog"
import { axConcepts, axLabs, axRoadmap } from "@/data/lab/ax-engineering"
import { handbookSections } from "@/data/lab/handbook"
import type { DocLevel } from "@/src/lib/types/handbook"

/** The handbook's own three levels map onto the Lab's shared difficulty filter. */
const HANDBOOK_DIFFICULTY: Record<DocLevel, EngineeringLabSearchItem["difficulty"]> = {
    foundation: "beginner",
    working: "intermediate",
    advanced: "advanced",
}

export interface EngineeringLabStats {
    aiArticles: number
    aiPrompts: number
    aiSnippets: number
    devopsTopics: number
    devopsLabs: number
    devopsCommands: number
    backendPublished: number
    backendPlanned: number
    axModules: number
    axLabs: number
}

export async function getEngineeringLabIndex(): Promise<{ items: EngineeringLabSearchItem[]; stats: EngineeringLabStats }> {
    const [articles, prompts, snippets] = await Promise.all([getAIArticles(), getAIPrompts(), getAISnippets()])
    const backendSummaries = getBackendSummaries()

    const items: EngineeringLabSearchItem[] = [
        ...articles.map((a) => ({
            title: a.title,
            description: a.description,
            href: `/ai-engineering/articles/${a.slug}`,
            source: "AI Engineering" as const,
            type: "Article",
            tags: a.tags,
            difficulty: a.difficulty,
        })),
        ...prompts.map((p) => ({
            title: p.title,
            description: p.description,
            href: `/ai-engineering/prompts`,
            source: "AI Engineering" as const,
            type: "Prompt",
            tags: p.tags,
        })),
        ...snippets.map((s) => ({
            title: s.title,
            description: s.explanation,
            href: `/ai-engineering/snippets`,
            source: "AI Engineering" as const,
            type: "Snippet",
            tags: s.tags,
        })),
        ...backendSummaries.map((item) => ({
            title: item.title,
            description: item.description,
            href: item.status === "published" ? `/lab/backend/${item.slug}` : "/lab/backend/roadmap",
            source: "Backend Engineering" as const,
            type: item.status === "planned" ? `Planned ${item.type}` : item.type,
            tags: [item.category, item.difficulty, ...item.technologies],
            difficulty: item.difficulty,
        })),
        ...handbookSections.map((section) => ({
            title: section.title,
            description: section.lead,
            href: `/lab/handbook#${section.id}`,
            source: "Agent Handbook" as const,
            type: "Handbook section",
            tags: [section.applies === "both" ? "Claude Code & Codex" : section.applies === "claude" ? "Claude Code" : "Codex", section.level],
            difficulty: HANDBOOK_DIFFICULTY[section.level],
        })),
        ...axRoadmap.map((module) => ({
            title: module.title,
            description: module.description,
            href: `/lab/ax-engineering#module-${module.slug}`,
            source: "AX Engineering" as const,
            type: "Learning module",
            tags: [module.status, ...module.concepts],
        })),
        ...axConcepts.map((concept) => ({
            title: concept.name,
            description: `${concept.what} ${concept.why}`,
            href: `/lab/ax-engineering#concept-${concept.slug}`,
            source: "AX Engineering" as const,
            type: "Concept",
            tags: [concept.analogy, concept.group],
        })),
        ...axLabs.map((lab) => ({
            title: `${lab.id} ${lab.title}`,
            description: lab.objective,
            href: "/lab/ax-engineering#labs",
            source: "AX Engineering" as const,
            type: "Lab",
            tags: lab.concepts,
        })),
        ...roadmap
            .filter((t) => t.hasCard)
            .map((t) => ({
                title: t.title,
                description: t.description,
                href: `/lab/devops/topics/${t.slug}`,
                source: "DevOps Basics" as const,
                type: "Topic",
                tags: [t.category],
                difficulty: t.difficulty,
            })),
        ...labs.map((l) => ({
            title: l.title,
            description: l.description,
            href: `/lab/devops/labs/${l.slug}`,
            source: "DevOps Basics" as const,
            type: "Lab",
            tags: [],
            difficulty: l.difficulty,
        })),
        ...commandCategories.flatMap((c) =>
            c.commands.map((cmd) => ({
                title: cmd.name,
                description: cmd.description,
                href: `/lab/devops/commands`,
                source: "DevOps Basics" as const,
                type: "Command",
                tags: [c.category],
            }))
        ),
        ...infraTerms.map((term) => ({
            title: term.term,
            description: term.definition,
            href: `/lab/devops/infrastructure`,
            source: "DevOps Basics" as const,
            type: "Infrastructure",
            tags: [term.category],
        })),
    ]

    const stats: EngineeringLabStats = {
        aiArticles: articles.length,
        aiPrompts: prompts.length,
        aiSnippets: snippets.length,
        devopsTopics: roadmap.filter((t) => t.hasCard).length,
        devopsLabs: labs.length,
        devopsCommands: commandCategories.reduce((sum, c) => sum + c.commands.length, 0),
        backendPublished: backendSummaries.filter((item) => item.status === "published").length,
        backendPlanned: backendSummaries.filter((item) => item.status === "planned").length,
        axModules: axRoadmap.length,
        axLabs: axLabs.length,
    }

    return { items, stats }
}
