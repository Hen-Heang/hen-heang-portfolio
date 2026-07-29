import { profileData } from "@/data/profile"
import type { KnowledgeSection } from "./types"

/** Derived from data/profile.ts. */
export const contactKnowledge: KnowledgeSection[] = [
    {
        id: "contact-channels",
        category: "contact",
        title: "How to contact Heang",
        keywords: [
            "contact", "email", "reach", "hire", "hiring", "message", "connect",
            "github", "linkedin", "telegram", "twitter", "x", "social", "cv",
            "resume", "download", "recruit", "opportunity", "available", "interview",
        ],
        core: true,
        sourceLabel: "Contact page",
        sourceUrl: "https://henheang.site/contact",
        content: [
            `- Email: ${profileData.email}`,
            `- GitHub: ${profileData.socialLinks.github}`,
            `- LinkedIn: ${profileData.socialLinks.linkedin}`,
            `- Telegram: ${profileData.socialLinks.telegram}`,
            `- X (Twitter): ${profileData.socialLinks.x}`,
            `- Resume (ATS-friendly HTML, view and print): ${profileData.cvUrl}`,
            `- Modern CV (HTML, view and print): https://henheang.site/cv`,
            `- Resume (ATS-friendly): https://henheang.site/resume`,
            `- Contact page: https://henheang.site/contact`,
            "",
            `Heang is based in ${profileData.location} and is ${profileData.available ? "open to new opportunities" : "not currently looking"}. Email and LinkedIn are the best channels for recruiters.`,
        ].join("\n"),
    },
]
