import type { PageContext } from "@/src/lib/ai/page-context"

export type PromptAudience = "recruiter" | "engineering-manager" | "developer" | "general"

export interface AssistantStarterPrompt {
    id: string
    audience: PromptAudience
    /** Short label shown on the chip */
    label: string
    /** Full question sent to the assistant */
    prompt: string
    /** Lower shows first within its audience group */
    priority: number
}

export const AUDIENCES: { id: PromptAudience; label: string }[] = [
    { id: "recruiter", label: "Recruiter" },
    { id: "engineering-manager", label: "Eng. manager" },
    { id: "developer", label: "Developer" },
    { id: "general", label: "General" },
]

/** Role-based prompt library — replaces the old single flat starter list. */
export const starterPrompts: AssistantStarterPrompt[] = [
    // Recruiter
    { id: "recruiter-summary", audience: "recruiter", label: "Summarize experience", prompt: "Summarize Heang's experience.", priority: 1 },
    { id: "recruiter-why-backend", audience: "recruiter", label: "Why a backend role?", prompt: "Why consider Heang for a backend role?", priority: 2 },
    { id: "recruiter-enterprise", audience: "recruiter", label: "Enterprise experience", prompt: "What enterprise experience does he have?", priority: 3 },
    { id: "recruiter-backend-or-fullstack", audience: "recruiter", label: "Backend or full-stack?", prompt: "Is he backend or full-stack?", priority: 4 },
    { id: "recruiter-resume", audience: "recruiter", label: "Show his resume", prompt: "Show his resume.", priority: 5 },
    { id: "recruiter-contact", audience: "recruiter", label: "Contact", prompt: "How can I contact him?", priority: 6 },

    // Engineering manager
    { id: "em-spring", audience: "engineering-manager", label: "Spring Boot experience", prompt: "Explain his Spring Boot experience.", priority: 1 },
    { id: "em-database", audience: "engineering-manager", label: "Database work", prompt: "What database work has he done?", priority: 2 },
    { id: "em-auth", audience: "engineering-manager", label: "Authentication", prompt: "How has he implemented authentication?", priority: 3 },
    { id: "em-systems", audience: "engineering-manager", label: "Systems built", prompt: "What systems has he built professionally?", priority: 4 },
    { id: "em-architecture", audience: "engineering-manager", label: "Strongest architecture", prompt: "What is his strongest architecture example?", priority: 5 },
    { id: "em-korean-teams", audience: "engineering-manager", label: "Korean enterprise teams", prompt: "How does he work with Korean enterprise teams?", priority: 6 },

    // Developer
    { id: "dev-strongest-project", audience: "developer", label: "Strongest backend project", prompt: "Show his strongest backend project.", priority: 1 },
    { id: "dev-mybatis", audience: "developer", label: "MyBatis projects", prompt: "Which projects use MyBatis?", priority: 2 },
    { id: "dev-hphsar", audience: "developer", label: "H-Phsar architecture", prompt: "Explain the H-Phsar architecture.", priority: 3 },
    { id: "dev-security", audience: "developer", label: "Spring Security usage", prompt: "How does he use Spring Security?", priority: 4 },
    { id: "dev-ai", audience: "developer", label: "AI in development", prompt: "How does he use AI in development?", priority: 5 },
    { id: "dev-github", audience: "developer", label: "GitHub repositories", prompt: "Show his GitHub repositories.", priority: 6 },

    // General (Now used as the default compact questions)
    { id: "gen-backend", audience: "general", label: "Backend experience", prompt: "What is Hen's backend experience?", priority: 1 },
    { id: "gen-projects", audience: "general", label: "Strongest projects", prompt: "Show his strongest projects.", priority: 2 },
    { id: "gen-tech", audience: "general", label: "Technologies used", prompt: "What technologies does he use?", priority: 3 },
    { id: "gen-contact", audience: "general", label: "Contact", prompt: "How can I contact him?", priority: 4 },
]

/** Page-aware prompts shown instead of the audience chips when the visitor opens the assistant from a specific page. */
export const pagePrompts: Partial<Record<PageContext, AssistantStarterPrompt[]>> = {
    home: [
        { id: "page-home-summary", audience: "general", label: "Summarize his background", prompt: "Summarize Heang's background.", priority: 1 },
        { id: "page-home-strongest-work", audience: "general", label: "Show strongest work", prompt: "Show his strongest work.", priority: 2 },
        { id: "page-home-why-backend", audience: "general", label: "Why backend-focused?", prompt: "Why is he backend-focused?", priority: 3 },
        { id: "page-home-resume", audience: "general", label: "View his resume", prompt: "View his resume.", priority: 4 },
    ],
    "projects-index": [
        { id: "page-projects-spring", audience: "general", label: "Best Spring Boot project", prompt: "Which project best shows Spring Boot?", priority: 1 },
        { id: "page-projects-compare", audience: "general", label: "Compare backend projects", prompt: "Compare his backend projects.", priority: 2 },
        { id: "page-projects-live", audience: "general", label: "Which are live?", prompt: "Which projects are live?", priority: 3 },
        { id: "page-projects-ai", audience: "general", label: "AI-enabled projects", prompt: "Show his AI-enabled projects.", priority: 4 },
    ],
    "project-detail": [
        { id: "page-project-problem", audience: "general", label: "What problem does it solve?", prompt: "What problem does this project solve?", priority: 1 },
        { id: "page-project-implement", audience: "general", label: "What did he implement?", prompt: "What did Heang implement in this project?", priority: 2 },
        { id: "page-project-architecture", audience: "general", label: "Explain the architecture", prompt: "Explain this project's architecture.", priority: 3 },
        { id: "page-project-security", audience: "general", label: "Security decisions", prompt: "What security decisions were made in this project?", priority: 4 },
        { id: "page-project-learn", audience: "general", label: "What did he learn?", prompt: "What did he learn from this project?", priority: 5 },
    ],
    resume: [
        { id: "page-resume-qualifications", audience: "recruiter", label: "Strongest qualifications", prompt: "Summarize his strongest qualifications.", priority: 1 },
        { id: "page-resume-roles", audience: "recruiter", label: "What roles match?", prompt: "What roles match this resume?", priority: 2 },
        { id: "page-resume-enterprise", audience: "recruiter", label: "Enterprise experience", prompt: "Explain his enterprise experience.", priority: 3 },
        { id: "page-resume-contact", audience: "recruiter", label: "Contact", prompt: "How can I contact him?", priority: 4 },
    ],
}

/** How many chips to show at once before the "More questions" action. */
export const VISIBLE_CHIP_COUNT = 4

export function promptsForAudience(audience: PromptAudience): AssistantStarterPrompt[] {
    return starterPrompts.filter((p) => p.audience === audience).sort((a, b) => a.priority - b.priority)
}
