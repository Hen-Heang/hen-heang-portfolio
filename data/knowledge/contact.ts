import { profileData } from "@/data/profile"
import type { ProfileContentParsed } from "@/src/lib/schemas/content"
import type { KnowledgeSection } from "./types"

/** Derived from the live profile (Supabase-backed, static fallback). */
export function buildContactKnowledge(profile: ProfileContentParsed): KnowledgeSection[] {
    return [
        {
            id: "contact-channels",
            category: "contact",
            title: "How to contact Heang",
            keywords: [
                "contact", "email", "reach", "hire", "hiring", "message", "connect",
                "github", "linkedin", "telegram", "twitter", "x", "facebook", "instagram", "social", "cv",
                "resume", "download", "recruit", "opportunity", "available", "interview",
            ],
            core: true,
            sourceLabel: "Contact page",
            sourceUrl: "https://henheang.site/contact",
            content: [
                `- Email: ${profile.email}`,
                `- GitHub: ${profile.socialLinks.github}`,
                `- LinkedIn: ${profile.socialLinks.linkedin}`,
                profile.socialLinks.telegram ? `- Telegram: ${profile.socialLinks.telegram}` : "",
                profile.socialLinks.x ? `- X (Twitter): ${profile.socialLinks.x}` : "",
                profile.socialLinks.facebook ? `- Facebook: ${profile.socialLinks.facebook}` : "",
                profile.socialLinks.instagram ? `- Instagram: ${profile.socialLinks.instagram}` : "",
                profile.cvUrl ? `- Resume (ATS-friendly HTML, view and print): ${profile.cvUrl}` : "",
                "- CV (modern HTML layout, view and print): https://henheang.site/cv",
                "- Contact page: https://henheang.site/contact",
                "",
                `Heang is based in ${profile.location} and is ${profile.available ? "open to new opportunities" : "not currently looking"}. Email and LinkedIn are the best channels for recruiters.`,
            ]
                .filter((line) => line !== "")
                .join("\n"),
        },
    ]
}

/** Static fallback, used when Supabase is unavailable. */
export const contactKnowledge: KnowledgeSection[] = buildContactKnowledge(profileData)
