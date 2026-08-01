import { profileData } from "@/data/profile"
import type { ProfileContentParsed } from "@/src/lib/schemas/content"
import type { KnowledgeSection } from "./types"

/**
 * Explicit professional positioning, kept as its own core section so the
 * assistant never drifts toward describing Heang as an "AI Engineer" — his
 * primary identity is backend development; AI is a supporting capability.
 * Derived from the live profile (Supabase-backed, static fallback) — not a
 * separate claim.
 */
export function buildPositioningKnowledge(profile: ProfileContentParsed): KnowledgeSection[] {
    return [
        {
            id: "positioning-primary",
            category: "positioning",
            title: "Professional positioning",
            keywords: [
                "positioning", "position", "role", "identity", "backend or frontend",
                "backend or full-stack", "full-stack", "fullstack", "what does he do",
                "what kind of developer", "primary focus", "job title",
            ],
            core: true,
            sourceLabel: "About page",
            sourceUrl: `${profile.portfolioUrl}/about`,
            content: [
                `${profile.fullName}'s primary identity is **${profile.title}** — Java, Spring Boot, MyBatis, REST APIs, and PostgreSQL/Oracle.`,
                "",
                `He extends into frontend delivery — Next.js, TypeScript, JavaScript, and jQuery — when a product needs it, most visibly in his current role at ${profile.company ?? "his current employer"}. Frontend work is a supporting capability, not his primary identity.`,
                "",
                "AI is likewise a supporting capability: he integrates AI features into applications (see the AI-assisted engineering section) and uses AI tools in his own development workflow. He is not positioned as an AI Engineer, ML engineer, or AI researcher.",
            ].join("\n"),
        },
        {
            id: "positioning-recruiter-fit",
            category: "positioning",
            title: "Recruiter fit — what kind of role suits him",
            keywords: [
                "fit", "recruiter fit", "role fit", "suits", "suitable", "match",
                "what kind of role", "good fit for", "enterprise experience",
                "international", "worked internationally", "backend evidence",
            ],
            sourceLabel: "About page",
            sourceUrl: `${profile.portfolioUrl}/about`,
            content: [
                "**Best-fit roles:** backend or Java/Spring Boot developer positions, especially where REST API design, MyBatis/JPA data access, and PostgreSQL/Oracle are core to the job. Full-stack roles that lean backend-heavy but need occasional Next.js/TypeScript frontend work are also a strong match.",
                "",
                `**Strongest backend evidence:** production REST APIs and data-access work at ${profile.company ?? "his current employer"} (Korean enterprise, government/corporate financial systems) and KOSIGN (B2B billing platform integrated with banking systems), plus personal Spring Boot projects (H-Phsar, AuthHub, and Dev Lab) covering authentication, order/state-machine logic, and schema design end to end.`,
                "",
                "**Enterprise experience:** yes — both employers operate in regulated, enterprise-scale environments (government-facing systems, banking integrations).",
                "",
                "**International experience:** yes — Cambodia-based work (KOSIGN) collaborating daily with Korean development teams, followed by relocating to work in Seoul, South Korea directly (Bizplay).",
            ].join("\n"),
        },
    ]
}

/** Static fallback, used when Supabase is unavailable. */
export const positioningKnowledge: KnowledgeSection[] = buildPositioningKnowledge(profileData)
