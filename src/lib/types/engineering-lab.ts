export type EngineeringLabSource = "Agent Handbook" | "AI Engineering" | "AX Engineering" | "Backend Engineering" | "DevOps Basics"

export interface EngineeringLabSearchItem {
    title: string
    description: string
    href: string
    source: EngineeringLabSource
    type: string
    tags: string[]
    /** Not available for every item (prompts/snippets/commands/infrastructure terms don't carry one) — filters treat "unknown" as its own bucket rather than hiding the item. */
    difficulty?: "beginner" | "intermediate" | "advanced"
}

export interface LabMetric {
    label: string
    value: number
    suffix?: string
}

export interface FeaturedWork {
    slug: string
    title: string
    description: string
    architecture: string[]
}
