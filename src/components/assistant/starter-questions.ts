import type { PageContext } from "@/src/lib/ai/page-context"

export interface AssistantStarterPrompt {
    id: string
    /** Short label shown on the chip */
    label: string
    /** Full question sent to the assistant */
    prompt: string
}

export const primaryQuestions: AssistantStarterPrompt[] = [
    { id: "pri-who", label: "Tell me about Heang", prompt: "Tell me about Heang." },
    { id: "pri-backend", label: "Backend experience", prompt: "What is his backend experience?" },
    { id: "pri-strongest", label: "Strongest project", prompt: "Show his strongest project." },
    { id: "pri-compare", label: "Compare projects", prompt: "Compare his backend projects." },
]

export const secondaryQuestions: AssistantStarterPrompt[] = [
    { id: "sec-live", label: "Live projects", prompt: "Which projects are live?" },
    { id: "sec-tech", label: "Technologies", prompt: "What technologies does he use?" },
    { id: "sec-github", label: "GitHub", prompt: "Show his GitHub." },
    { id: "sec-work", label: "Work experience", prompt: "What is his work experience?" },
    { id: "sec-ai", label: "AI usage", prompt: "How does he use AI?" },
    { id: "sec-avail", label: "Availability", prompt: "What is his availability?" },
    { id: "sec-contact", label: "Contact details", prompt: "How can I contact him?" },
]

/** Page-aware prompts shown instead of the default mix when the visitor opens the assistant from a specific page. */
export const pagePrompts: Partial<Record<PageContext, AssistantStarterPrompt[]>> = {
    home: [
        { id: "page-home-who", label: "Who is Heang?", prompt: "Who is Hen Heang?" },
        { id: "page-home-strongest-work", label: "Strongest work", prompt: "Show his strongest work." },
        { id: "page-home-why-backend", label: "Why backend?", prompt: "Why is he backend-focused?" },
        { id: "page-home-contact", label: "Contact him", prompt: "How can I contact him?" },
    ],
    "projects-index": [
        { id: "page-projects-spring", label: "Spring Boot project", prompt: "Which project best shows Spring Boot?" },
        { id: "page-projects-compare", label: "Compare projects", prompt: "Compare his backend projects." },
        { id: "page-projects-live", label: "Live projects", prompt: "Which projects are live?" },
        { id: "page-projects-ai", label: "AI-enabled projects", prompt: "Show his AI-enabled projects." },
    ],
    "project-detail": [
        { id: "page-project-problem", label: "Problem solved", prompt: "What problem does this project solve?" },
        { id: "page-project-implement", label: "Implementation", prompt: "What did Heang implement in this project?" },
        { id: "page-project-architecture", label: "Architecture", prompt: "Explain this project's architecture." },
        { id: "page-project-learn", label: "Lessons learned", prompt: "What did he learn from this project?" },
    ],
    experience: [
        { id: "page-exp-qualifications", label: "Qualifications", prompt: "Summarize his strongest qualifications." },
        { id: "page-exp-roles", label: "Role match", prompt: "What roles match his experience?" },
        { id: "page-exp-enterprise", label: "Enterprise experience", prompt: "Explain his enterprise experience." },
        { id: "page-exp-contact", label: "Contact details", prompt: "How can I contact him?" },
    ],
    skills: [
        { id: "page-skills-backend", label: "Backend skills", prompt: "What are his core backend skills?" },
        { id: "page-skills-devops", label: "DevOps & Cloud", prompt: "What DevOps and Cloud tools does he use?" },
        { id: "page-skills-languages", label: "Languages", prompt: "What programming languages does he know?" },
        { id: "page-skills-ai", label: "AI tools", prompt: "What AI tools does he use?" },
    ],
    contact: [
        { id: "page-contact-email", label: "Email", prompt: "What is his email address?" },
        { id: "page-contact-linkedin", label: "LinkedIn", prompt: "Show his LinkedIn profile." },
        { id: "page-contact-github", label: "GitHub", prompt: "Show his GitHub profile." },
        { id: "page-contact-avail", label: "Availability", prompt: "What is his availability?" },
    ],
}

/** Always show exactly 4 chips. */
export const VISIBLE_CHIP_COUNT = 4

