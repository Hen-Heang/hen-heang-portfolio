import "server-only"

/**
 * Server-side moderation gate, checked between rate limiting and the main
 * model call. Isolated from app/api/chat/route.ts on purpose so the request
 * handler stays a thin orchestrator.
 *
 * The Vercel AI SDK and @ai-sdk/openai don't wrap OpenAI's moderation
 * endpoint (it isn't a "language model" in their abstraction), so this calls
 * https://api.openai.com/v1/moderations directly with the current
 * `omni-moderation-latest` model.
 *
 * Failure behavior (deliberate, not an oversight): this is a public
 * portfolio site, not a system handling money or sensitive user data, and
 * the main model already has its own scope/grounding rules as a second
 * layer of defense. So a moderation-service outage or timeout fails OPEN —
 * the message proceeds to the model rather than taking the whole assistant
 * down — and is logged so a sustained outage is visible in ops logs. Only an
 * actual `flagged: true` verdict blocks the request.
 */

const MODERATION_MODEL = "omni-moderation-latest"
const MODERATION_TIMEOUT_MS = 5_000

export interface ModerationResult {
    flagged: boolean
}

interface ModerationApiResponse {
    results?: { flagged?: boolean }[]
}

export async function moderateInput(text: string): Promise<ModerationResult> {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) return { flagged: false }

    try {
        const response = await fetch("https://api.openai.com/v1/moderations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({ model: MODERATION_MODEL, input: text }),
            signal: AbortSignal.timeout(MODERATION_TIMEOUT_MS),
        })

        if (!response.ok) {
            console.warn(JSON.stringify({ event: "moderation_request_failed", status: response.status, ts: new Date().toISOString() }))
            return { flagged: false }
        }

        const data = (await response.json()) as ModerationApiResponse
        return { flagged: data.results?.[0]?.flagged === true }
    } catch (error) {
        const timedOut = error instanceof Error && error.name === "TimeoutError"
        console.warn(JSON.stringify({ event: "moderation_error", reason: timedOut ? "timeout" : "unknown", ts: new Date().toISOString() }))
        return { flagged: false }
    }
}
