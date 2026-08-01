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
    title: "Backend-focused Software Engineer",

    /** Hero lead — what he builds, in one sentence. */
    description:
        "Building reliable Java and Spring Boot systems with modern web technologies.",

    /** Hero supporting paragraph — the concrete scope of the work. */
    supporting:
        "I develop enterprise APIs, database-driven applications and AI-enabled products using Spring Boot, PostgreSQL, MyBatis and Next.js.",

    /**
     * About narrative, as three paragraphs. Rendered on /about and reused as
     * the homepage About summary and in the assistant's knowledge base, so
     * the same story is told everywhere.
     */
    about: [
        "I'm Hen Heang, a Cambodian software engineer currently working in South Korea. I specialize in Java, Spring Boot, MyBatis and PostgreSQL, with frontend experience using Next.js and TypeScript.",
        "My professional work focuses on enterprise systems, API development and database-driven applications. I also build practical products in real estate, personal finance and AI-assisted learning.",
        "I care about maintainable architecture, clear business logic and software that solves real problems.",
    ],
} as const

/** Single-paragraph form of the About narrative, for metadata and the CV summary. */
export const aboutSummary = positioning.about.join(" ")
