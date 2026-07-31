import { profileData } from "@/data/profile"
import type { ProfileContentParsed } from "@/src/lib/schemas/content"
import type { KnowledgeSection } from "./types"

/**
 * Exposed as a builder so the live knowledge layer can rebuild these sections
 * from Supabase (`portfolio_site_content`, key "profile" — the same
 * admin-editable source the /about page renders from), falling back to
 * data/profile.ts when Supabase is unavailable. This keeps the assistant from
 * drifting out of sync whenever the profile is edited through the admin panel.
 */
export function buildProfileKnowledge(profile: ProfileContentParsed): KnowledgeSection[] {
    return [
        {
            id: "profile-overview",
            category: "profile",
            title: "Who is Hen Heang",
            keywords: [
                "hen", "heang", "who", "about", "introduction", "summary", "background",
                "developer", "backend", "bio", "overview", "himself", "career",
            ],
            core: true,
            sourceLabel: "About page",
            sourceUrl: `${profile.portfolioUrl}/about`,
            content: [
                `**${profile.fullName}**${profile.koreanName ? ` (Korean: ${profile.koreanName})` : ""} is a ${profile.title} based in ${profile.location}${profile.locationEmoji ? ` ${profile.locationEmoji}` : ""}${profile.company ? `, currently working at **${profile.company}**` : ""}.`,
                "",
                profile.description,
                "",
                `- Years of experience: ${profile.yearsExperience}`,
                `- Currently available for opportunities: ${profile.available ? "yes" : "no"}`,
                `- Portfolio: ${profile.portfolioUrl}`,
                profile.cvUrl ? `- CV: ${profile.cvUrl}` : "",
            ]
                .filter((line) => line !== "")
                .join("\n"),
        },
        {
            id: "profile-languages",
            category: "profile",
            title: "Spoken languages",
            keywords: ["language", "languages", "speak", "khmer", "english", "korean", "communication"],
            sourceLabel: "About page",
            sourceUrl: `${profile.portfolioUrl}/about`,
            content: (profile.languages ?? [])
                .map((lang) => `- ${lang.name}: ${lang.level}`)
                .join("\n"),
        },
        {
            id: "profile-core-skills",
            category: "profile",
            title: "Core skills at a glance",
            keywords: ["core", "skills", "linkedin", "stack", "technologies", "tools", "main"],
            sourceLabel: "About page",
            sourceUrl: `${profile.portfolioUrl}/about`,
            content: `Core skills (as listed on LinkedIn): ${profile.linkedinCoreSkills.join(", ")}.${(profile.ides?.length ?? 0) > 0 ? `\n\nDaily IDEs: ${profile.ides!.join(", ")}.` : ""}`,
        },
    ]
}

/** Static fallback, used when Supabase is unavailable. */
export const profileKnowledge: KnowledgeSection[] = buildProfileKnowledge(profileData)
