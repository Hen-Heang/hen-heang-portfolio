import "server-only"

import { createSkillsTool } from "./skills"
import { createProjectTools } from "./projects"
import { createExperienceTool } from "./experience"
import { createLabTools } from "./lab"
import { noopToolLogger, type ToolLogger } from "./logging"

export type { ToolLogger } from "./logging"

/**
 * Tool-calling layer for the portfolio assistant — one small file per
 * portfolio area (skills, projects, experience, Engineering Lab), each
 * reading directly from the existing portfolio-knowledge / retrieval /
 * lab-knowledge modules. No duplicate data sources, no embeddings.
 *
 * `logger` is injected per request (see app/api/chat/route.ts) so tool-call
 * logging can be correlated with the request's hashed client key without any
 * module-level mutable state.
 */
export function createPortfolioTools(logger: ToolLogger = noopToolLogger) {
    return {
        getSkills: createSkillsTool(logger),
        ...createProjectTools(logger),
        getExperience: createExperienceTool(logger),
        ...createLabTools(logger),
    }
}

/** Convenience singleton (no-op logging) for tests and the live-model eval harness, where request correlation doesn't apply. */
export const portfolioTools = createPortfolioTools()
