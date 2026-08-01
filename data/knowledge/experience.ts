import { experiences as staticExperiences } from "@/data/experience"
import { education as staticEducation } from "@/data/education"
import type { EducationItem, ExperienceItem } from "@/src/lib/types"
import type { KnowledgeSection } from "./types"

/**
 * Work-history and education sections. Exposed as a builder so the live
 * knowledge layer can rebuild them from Supabase rows; the static export
 * below is the fallback when the database is unavailable.
 */
export function buildExperienceKnowledge(
    experiences: ExperienceItem[],
    education: EducationItem[],
): KnowledgeSection[] {
    const experienceContent = experiences
        .map((job) =>
            [
                `### ${job.role} — ${job.company}`,
                [job.period, job.location].filter(Boolean).join(" · "),
                "",
                job.summary ?? "",
                "",
                ...(job.highlights ?? []).map((h) => `- ${h}`),
                ...(job.stack?.length ? ["", `Stack: ${job.stack.join(", ")}`] : []),
            ].join("\n"),
        )
        .join("\n\n")

    const educationContent = education
        .map((item) => `- **${item.title.trim()}** — ${item.institution.trim()} (${item.period})${item.description ? `: ${item.description}` : ""}`)
        .join("\n")

    return [
        {
            id: "experience-work-history",
            category: "experience",
            title: "Work experience",
            keywords: [
                "experience", "work", "job", "career", "company", "bizplay", "kosign",
                "employer", "history", "role", "professional", "professionally", "enterprise", "korea",
                "cambodia", "billing", "financial", "b2b", "years", "backend", "systems", "built",
            ],
            sourceLabel: "About page — experience timeline",
            sourceUrl: "https://henheang.site/about",
            content: experienceContent,
        },
        {
            id: "experience-education",
            category: "experience",
            title: "Education and training",
            keywords: [
                "education", "educational", "background", "study", "university", "degree", "bootcamp", "training",
                "school", "hrd", "computer science", "learn", "certificate",
            ],
            sourceLabel: "About page — experience timeline",
            sourceUrl: "https://henheang.site/about",
            content: educationContent,
        },
    ]
}

/** Derived from data/experience.ts and data/education.ts. */
export const experienceKnowledge: KnowledgeSection[] = buildExperienceKnowledge(staticExperiences, staticEducation)
