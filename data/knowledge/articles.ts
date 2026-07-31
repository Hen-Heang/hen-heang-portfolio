import { performanceTechniques } from "@/data/lab/performance"
import type { KnowledgeSection } from "./types"

/**
 * The Engineering Lab (https://henheang.site/lab) is where Heang documents
 * engineering write-ups: system design walkthroughs, performance techniques,
 * a Java/Spring backend curriculum, and a DevOps learning roadmap.
 * Derived from data/lab/*.
 */
export const articlesKnowledge: KnowledgeSection[] = [
    {
        id: "articles-engineering-lab",
        category: "articles",
        title: "Engineering Lab — articles and write-ups",
        keywords: [
            "articles", "article", "blog", "write", "writing", "lab", "engineering lab",
            "content", "posts", "documentation", "backend", "java", "spring boot",
            "devops", "roadmap", "system design", "diagrams", "learning", "notes",
        ],
        sourceLabel: "Engineering Lab",
        sourceUrl: "https://henheang.site/lab",
        content: [
            "Heang publishes engineering write-ups on his portfolio's **Engineering Lab** (https://henheang.site/lab):",
            "",
            "- **Systems** — architecture walkthroughs of each portfolio project, with diagrams, challenges, solutions, and lessons learned.",
            "- **Performance** — techniques applied in real projects: caching, optimistic UI, background jobs, data access, and reliability.",
            "- **Backend Engineering Lab** (https://henheang.site/lab/backend) — a 13-level Java and Spring Boot roadmap with published guides, a Task API lab, production checklists, interview questions, and planned curriculum metadata.",
            "- **DevOps Lab** — a documented learning roadmap covering Git, Docker, CI/CD with GitHub Actions, and Nginx, each with overview, why it matters, how backend devs use it, common mistakes, and example commands.",
            "- **AI Engineering** (https://henheang.site/ai-engineering) — a prompt library for backend, API design, database, code review, bug fixing, refactoring, system design, and learning.",
        ].join("\n"),
    },
    {
        id: "articles-performance-techniques",
        category: "articles",
        title: "Performance techniques from real projects",
        keywords: [
            "performance", "optimization", "caching", "cache", "optimistic",
            "background jobs", "cron", "reliability", "data access", "query", "speed",
        ],
        sourceLabel: "Engineering Lab — performance",
        sourceUrl: "https://henheang.site/lab/performance",
        content: performanceTechniques
            .map((t) => `- **${t.category}** (${t.project}): ${t.text}`)
            .join("\n"),
    },
]
