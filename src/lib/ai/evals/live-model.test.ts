import { describe, expect, it } from "vitest"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

import { buildContext } from "../retrieval"
import { buildSystemPrompt } from "../system-prompt"
import { MODELS } from "../models"
import { portfolioTools } from "../tools"
import { portfolioEvalCases } from "./portfolio-questions"

/**
 * Live-model evaluation pass — makes real OpenAI API calls and costs real
 * tokens. Skipped by default; run explicitly with:
 *
 *   RUN_LIVE_EVALS=1 OPENAI_API_KEY=sk-... pnpm test live-model
 *
 * Never runs in normal `pnpm test` / CI unless both `RUN_LIVE_EVALS` and a
 * real `OPENAI_API_KEY` are present.
 */
const liveEvalsEnabled = process.env.RUN_LIVE_EVALS === "1" && Boolean(process.env.OPENAI_API_KEY)

describe.skipIf(!liveEvalsEnabled)("portfolio live-model evals", () => {
    for (const testCase of portfolioEvalCases) {
        it(`[${testCase.category}/${testCase.language ?? "en"}] ${testCase.id}`, async () => {
            const context = await buildContext([testCase.question])
            const { text } = await generateText({
                model: openai.responses(MODELS.default),
                system: buildSystemPrompt(context),
                prompt: testCase.question,
                tools: portfolioTools,
                maxOutputTokens: 800,
            })
            const lower = text.toLowerCase()

            for (const fact of testCase.requiredFacts ?? []) {
                expect(lower, `expected the answer to "${testCase.question}" to mention "${fact}"\n\nGot:\n${text}`).toContain(fact.toLowerCase())
            }

            for (const claim of testCase.forbiddenClaims ?? []) {
                expect(lower, `expected the answer to "${testCase.question}" to avoid "${claim}"\n\nGot:\n${text}`).not.toContain(claim.toLowerCase())
            }
        }, 30_000)
    }
})
