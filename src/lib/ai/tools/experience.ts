import "server-only"

import { z } from "zod"
import { tool } from "ai"

import { getExperience } from "../portfolio-knowledge"
import { withTiming, type ToolLogger } from "./logging"

export function createExperienceTool(logger: ToolLogger) {
    return tool({
        description: "Heang's professional work experience — roles, companies, dates, responsibilities, stack. Use for questions about professional experience, employers, career history, or responsibilities. This is strictly paid work history — never conflate it with personal projects or Engineering Lab learning.",
        inputSchema: z.object({}),
        execute: withTiming("getExperience", logger, async () => ({
            experience: getExperience().map((item) => ({
                role: item.role,
                company: item.company,
                period: item.period,
                location: item.location ?? null,
                summary: item.summary,
                highlights: item.highlights ?? [],
                stack: item.stack ?? [],
            })),
        })),
    })
}
