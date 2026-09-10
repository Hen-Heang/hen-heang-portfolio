import { performanceTechniques } from "@/data/lab/performance"
import type { KnowledgeSection } from "./types"

/**
 * The Engineering Lab (https://henheang.site/lab) is where Heang documents
 * engineering write-ups: system design walkthroughs, performance techniques,
 * Java/Spring and DevOps learning roadmaps, and a structured AX curriculum.
 * Derived from data/lab/*.
 */
export const articlesKnowledge: KnowledgeSection[] = [
    {
        id: "articles-engineering-lab",
        category: "articles",
        title: "Engineering Lab — articles and write-ups",
        keywords: ["articles", "article", "blog", "write", "writing", "lab", "engineering lab", "content", "posts", "documentation", "backend", "java", "spring boot", "devops", "roadmap", "system design", "diagrams", "learning", "notes", "ax engineering", "agent harness", "mcp", "evals"],
        sourceLabel: "Engineering Lab",
        sourceUrl: "https://henheang.site/lab",
        content: [
            "Heang publishes engineering write-ups on his portfolio's **Engineering Lab** (https://henheang.site/lab):",
            "",
            "- **Systems** — architecture walkthroughs of each portfolio project, with diagrams, challenges, solutions, and lessons learned.",
            "- **Performance** — techniques applied in real projects: caching, optimistic UI, background jobs, data access, and reliability.",
            "- **Backend Engineering Lab** (https://henheang.site/lab/backend) — a 13-level Java and Spring Boot roadmap with published guides, a Task API lab, production checklists, interview questions, and planned curriculum metadata.",
            "- **DevOps Lab** — a documented learning roadmap covering Git, Docker, CI/CD with GitHub Actions, and Nginx, each with overview, why it matters, how backend devs use it, common mistakes, and example commands.",
            "- **AX Engineering Learning Path** (https://henheang.site/lab/ax-engineering) — a structured, learning-only curriculum covering Agent Harness concepts, context, tools, MCP, guardrails, quality gates, evaluations, observability, and handoff.",
            "- **AI Engineering Library** (https://henheang.site/ai-engineering) — the broader reference collection for articles, prompts, snippets, code review, experiments, and AI-assisted development notes.",
        ].join("\n"),
    },
    {
        id: "articles-performance-techniques",
        category: "articles",
        title: "Performance techniques from real projects",
        keywords: ["performance", "optimization", "caching", "cache", "optimistic", "background jobs", "cron", "reliability", "data access", "query", "speed"],
        sourceLabel: "Engineering Lab — performance",
        sourceUrl: "https://henheang.site/lab/performance",
        content: performanceTechniques.map((t) => `- **${t.category}** (${t.project}): ${t.text}`).join("\n"),
    },
]
