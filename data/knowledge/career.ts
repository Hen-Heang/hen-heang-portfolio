import { profileData } from "@/data/profile"
import type { ProfileContentParsed } from "@/src/lib/schemas/content"
import type { KnowledgeSection } from "./types"

/**
 * The Cambodia-to-Korea career narrative and the confidential-work framing.
 * Synthesizes facts already present in data/experience.ts and data/education.ts
 * (see the "experience" category sections) into the trajectory recruiters ask
 * about — it must never introduce a fact that isn't already backed there.
 */
export function buildCareerKnowledge(profile: ProfileContentParsed): KnowledgeSection[] {
    return [
        {
            id: "career-journey",
            category: "career",
            title: "Career journey — Cambodia to South Korea",
            keywords: [
                "journey", "career journey", "career path", "story", "timeline",
                "cambodia", "korea", "move", "moved", "relocated", "background",
                "how did he start", "rupp", "hrd",
            ],
            sourceLabel: "About page — career timeline",
            sourceUrl: `${profile.portfolioUrl}/about`,
            content: [
                `${profile.fullName} started in Cambodia: a Computer Science degree at the Royal University of Phnom Penh (2020–2024), alongside hands-on training at the Korea Software HRD Center (full-stack development, then Android/mobile) and an earlier C++ fundamentals course.`,
                "",
                "That training led directly to his first professional role — Software Engineer at KOSIGN (Korea Software Innovation Global Network) in Phnom Penh, Cambodia, from January 2024, building a B2B billing and payment platform with Spring Boot, MyBatis, and PostgreSQL while collaborating daily with Korean development teams.",
                "",
                "In October 2025 he moved to Seoul, South Korea, to work directly in the Korean enterprise sector — his current role as a Backend Developer (Java & Spring Boot) at Bizplay, building enterprise financial web applications for government and corporate clients on Java, MyBatis, and Oracle.",
                "",
                "Throughout, his career direction has stayed backend-focused: each step (Cambodia training → KOSIGN → Bizplay) deepened the same core stack — Java, Spring Boot/MyBatis, and relational databases — rather than pivoting toward a different specialty.",
            ].join("\n"),
        },
        {
            id: "career-confidential-work",
            category: "career",
            title: "Confidential professional work",
            keywords: [
                "confidential", "nda", "can't share", "cannot share", "source code",
                "company code", "screenshots", "proprietary", "private", "internal",
                "bizplay project", "kosign project", "employer work",
            ],
            content: [
                "Heang's employer work at Bizplay and KOSIGN involves proprietary business systems — the source code, internal URLs, customer data, and production details belong to those companies and aren't shareable, the same way any employee's day job code isn't public.",
                "",
                "What can be discussed instead: his responsibilities and the technologies used — Java, MyBatis, Spring Boot, Spring Security/JWT, PostgreSQL, Oracle, SQL query design and optimization, and enterprise frontend work with JavaScript/jQuery — plus the general shape of the systems (government-facing financial web applications at Bizplay; a B2B billing platform integrated with banking systems at KOSIGN). For code-level detail, his personal projects (H-Phsar, AuthHub, Hengo, Money Flow) are fully public on GitHub and cover the same stack.",
            ].join("\n"),
        },
    ]
}

/** Static fallback, used when Supabase is unavailable. */
export const careerKnowledge: KnowledgeSection[] = buildCareerKnowledge(profileData)
