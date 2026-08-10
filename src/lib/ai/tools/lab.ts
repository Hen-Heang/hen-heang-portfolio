import "server-only"

import { z } from "zod"
import { tool } from "ai"

import { searchLabContent, getLabItem } from "../lab-knowledge"
import { withTiming, type ToolLogger } from "./logging"

/** Coarser than the skills taxonomy's categories — the Engineering Lab is organized into exactly these three sections. */
const LAB_CATEGORIES = ["backend", "devops", "ai"] as const

export function createLabTools(logger: ToolLogger) {
    const searchEngineeringLab = tool({
        description:
            "Search Heang's Engineering Lab (henheang.site/lab, /ai-engineering) — his write-ups, guides, and hands-on exercises. Use for \"what has he learned/studied/practiced about X\". Lab content is learning/practice evidence, never professional or project experience — describe it as study/practice (e.g. \"he's studied X in his Engineering Lab\"); use getSkills/searchProjects instead for work history or shipped projects. Returns a few compact summaries — call getLabItem with a result's slug for a fuller excerpt.",
        inputSchema: z.object({
            query: z.string().min(1).describe("What to search for, e.g. \"Docker\", \"Spring Security\", \"CI/CD\", \"AI agents\"."),
            category: z.enum(LAB_CATEGORIES).optional().describe("Filter to one Lab section."),
            limit: z.number().int().min(1).max(8).optional().describe("Max results (default 5)."),
        }),
        execute: withTiming("searchEngineeringLab", logger, async ({ query, category, limit }: { query: string; category?: (typeof LAB_CATEGORIES)[number]; limit?: number }) => ({
            results: await searchLabContent(query, { category, limit }),
        })),
    })

    const getLabItemTool = tool({
        description: "Full excerpt for one Engineering Lab item by slug (get the slug from searchEngineeringLab first). Only call when the search summary isn't enough detail.",
        inputSchema: z.object({
            slug: z.string().min(1).describe("The Lab item's slug, e.g. \"spring-boot-layered-architecture\" or \"docker\"."),
        }),
        execute: withTiming("getLabItem", logger, async ({ slug }: { slug: string }) => getLabItem(slug)),
    })

    return { searchEngineeringLab, getLabItem: getLabItemTool }
}
