import "server-only"

import { z } from "zod"
import { tool } from "ai"

import { getSkills } from "../portfolio-knowledge"
import { withTiming, type ToolLogger } from "./logging"

const SKILL_CATEGORIES = ["backend", "database", "frontend", "devops", "ai"] as const
const SKILL_STATUSES = ["primary", "working-knowledge", "learning"] as const

export function createSkillsTool(logger: ToolLogger) {
    return tool({
        description:
            "Heang's skills, optionally filtered by category and/or status. Use for any question about a specific skill/technology or \"what skills does he have\". `status`: primary = confident/established, working-knowledge = real but secondary, learning = currently exploring, never experience. A technology absent from the result means he hasn't worked with or studied it.",
        inputSchema: z.object({
            category: z.enum(SKILL_CATEGORIES).optional().describe("Filter to one skill area."),
            status: z.enum(SKILL_STATUSES).optional().describe("Filter to one depth level."),
        }),
        execute: withTiming("getSkills", logger, async ({ category, status }: { category?: (typeof SKILL_CATEGORIES)[number]; status?: (typeof SKILL_STATUSES)[number] }) => {
            let result = getSkills()
            if (category) result = result.filter((skill) => skill.category === category)
            if (status) result = result.filter((skill) => skill.status === status)
            return {
                skills: result.map((skill) => ({
                    name: skill.name,
                    category: skill.category,
                    status: skill.status,
                    description: skill.description,
                    projectSlugs: skill.projectSlugs,
                })),
            }
        }),
    })
}
