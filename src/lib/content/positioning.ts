/**
 * Canonical positioning copy — the single source of truth for how the
 * portfolio describes Heang.
 *
 * These strings are code-owned on purpose. They are editorial positioning
 * (not structured records), they must stay identical across the homepage,
 * About page, CV, page metadata, and the AI assistant, and they are reviewed
 * in pull requests like any other copy. Structured content — projects,
 * experience, education, skills, CV sections — stays Supabase-first with the
 * `data/*.ts` files as its typed fallback (see src/lib/db/portfolio.ts).
 *
 * Nothing here may claim experience, metrics, or technologies that aren't
 * evidenced elsewhere in the portfolio data.
 */

export const positioning = {
    /** Hero H2 — the one-line role statement. */
    title: "Backend / AX Software Engineer",

    /** Hero lead — what he builds, in one sentence. */
    description:
        "Building reliable Java and Spring Boot systems while learning to make human + AI development workflows repeatable.",

    /** Hero supporting paragraph — the concrete scope of the work. */
    supporting:
        "My foundation is backend engineering: enterprise APIs, business logic, and data-driven applications with Java, Spring Boot, MyBatis, PostgreSQL, and Oracle. I use AI-assisted development in practice and am building deeper understanding of Agent Harness, MCP, guardrails, and evaluations.",

    /**
     * About narrative, as three paragraphs. Rendered on /about and reused as
     * the homepage About summary and in the assistant's knowledge base, so
     * the same story is told everywhere.
     */
    about: [
        "I'm Hen Heang, a Cambodian software engineer currently working in South Korea. My primary foundation is backend engineering with Java, Spring Boot, MyBatis, PostgreSQL, and Oracle, supported by frontend delivery with Next.js and TypeScript.",
        "My professional work focuses on enterprise systems, API development, and SQL-driven business logic. In personal projects, I have also integrated practical AI features and used Claude Code and Codex as development assistants.",
        "I am growing toward Backend / AX Software Engineer through learning and practice in Agent Harness design, MCP, evaluations, DevOps, and system architecture. I care about maintainable systems, explicit decisions, verification, and software that solves real problems.",
    ],
} as const

/** Single-paragraph form of the About narrative, for metadata and the CV summary. */
export const aboutSummary = positioning.about.join(" ")
