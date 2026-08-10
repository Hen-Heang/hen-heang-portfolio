import { createHash } from "node:crypto"

import { openai } from "@ai-sdk/openai"
import { convertToModelMessages, createUIMessageStream, createUIMessageStreamResponse, stepCountIs, streamText, toUIMessageStream } from "ai"

import { buildContext } from "@/src/lib/ai/retrieval"
import { buildSystemPrompt } from "@/src/lib/ai/system-prompt"
import { createRateLimiter } from "@/src/lib/rate-limit/factory"
import { clientKeyFromRequest } from "@/src/lib/rate-limit/client-key"
import { validateChatBody } from "@/src/lib/ai/validation"
import { MODELS, selectModel } from "@/src/lib/ai/models"
import { createPortfolioTools } from "@/src/lib/ai/tools"
import { moderateInput } from "@/src/lib/ai/moderation"
import { buildPortfolioMeta, type ToolCallRecord } from "@/src/lib/ai/response-builder"
import { hasPortfolioMeta, type PortfolioUIMessage } from "@/src/lib/ai/response-schema"

const chatLimiter = createRateLimiter("chat", 60_000, 10)

export const maxDuration = 30
/** Leaves margin under `maxDuration` for the provider request to abort cleanly and still return a friendly error. */
const REQUEST_TIMEOUT_MS = 25_000
/** A portfolio question normally needs at most a couple of tool calls plus a final answer — this bounds the agent loop well under the AI SDK's own default (20) so a confused model can't spin. */
const MAX_AGENT_STEPS = 5

const jsonError = (message: string, status: number, headers?: HeadersInit) =>
    Response.json({ error: message }, { status, headers })

/** Structured, content-free abuse/ops logging — never the message text, never tool arguments/results, never the raw IP. */
function logEvent(event: string, clientKey: string, extra?: Record<string, string | number>): void {
    console.log(JSON.stringify({ event, client: hashClientKey(clientKey), ts: new Date().toISOString(), ...extra }))
}

/** Stable but non-reversible per-client identifier — safe to log and safe to pass to OpenAI as the `safetyIdentifier` for abuse detection. */
function hashClientKey(clientKey: string): string {
    return createHash("sha256").update(clientKey).digest("hex").slice(0, 24)
}

export async function POST(req: Request) {
    const clientKey = clientKeyFromRequest(req)

    if (!process.env.OPENAI_API_KEY) {
        return jsonError("The assistant isn't configured yet — please email Heang directly instead.", 503)
    }

    const rate = await chatLimiter.check(clientKey)
    if (!rate.allowed) {
        logEvent("rate_limited", clientKey)
        return jsonError("You're sending messages a bit fast — please wait a moment and try again.", 429, {
            "Retry-After": String(rate.retryAfterSeconds ?? 60),
        })
    }

    let body: unknown
    try {
        body = await req.json()
    } catch {
        return jsonError("Invalid request body.", 400)
    }

    const validation = validateChatBody(body)
    if (!validation.ok || !validation.messages || !validation.userTexts) {
        logEvent("validation_failed", clientKey, { reason: validation.error ?? "unknown" })
        return jsonError(validation.error ?? "Invalid request.", 400)
    }

    const { userTexts, messages, page, projectSlug, preferFallback } = validation
    const latestUserText = userTexts[userTexts.length - 1] ?? ""

    const moderation = await moderateInput(latestUserText)
    if (moderation.flagged) {
        logEvent("moderation_flagged", clientKey)
        return jsonError("That message can't be processed — please rephrase and try again.", 400)
    }

    const selection = preferFallback
        ? { tier: "default" as const, model: MODELS.fallback, reasoningEffort: "low" as const, textVerbosity: "low" as const, maxOutputTokens: 700 }
        : selectModel(latestUserText)

    const context = await buildContext(userTexts, { page, projectSlug })

    logEvent("chat_request", clientKey, { tier: selection.tier, model: selection.model, page: page ?? "other" })

    const tools = createPortfolioTools((tool, durationMs, success) =>
        logEvent("tool_call", clientKey, { tool, durationMs, success: String(success) }),
    )

    const result = streamText({
        model: openai.responses(selection.model),
        system: buildSystemPrompt(context),
        messages: await convertToModelMessages(messages),
        tools,
        stopWhen: stepCountIs(MAX_AGENT_STEPS),
        maxOutputTokens: selection.maxOutputTokens,
        abortSignal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        providerOptions: {
            openai: {
                reasoningEffort: selection.reasoningEffort,
                textVerbosity: selection.textVerbosity,
                safetyIdentifier: hashClientKey(clientKey),
            },
        },
    })

    // Never leak provider errors (keys, quotas, stack traces) to the client.
    const friendlyStreamError = (error: unknown): string => {
        logEvent("stream_error", clientKey, { model: selection.model })
        const timedOut = error instanceof Error && error.name === "AbortError"
        return timedOut
            ? "That took too long to answer — please try again in a moment."
            : "Something went wrong while answering. Please try again in a moment."
    }

    // The answer streams as ordinary text exactly as before (see
    // src/lib/ai/response-builder.ts for why this isn't the model's own
    // structured/JSON output). Once the underlying generation is fully
    // drained — `result.steps` only resolves after that — the evidence,
    // skills, and suggested questions this turn's tool calls actually
    // produced are assembled and attached as one extra `data-portfolio`
    // message part, at no added latency or token cost.
    const stream = createUIMessageStream<PortfolioUIMessage>({
        execute: async ({ writer }) => {
            writer.merge(toUIMessageStream({ stream: result.stream, tools, onError: friendlyStreamError }))

            try {
                const steps = await result.steps
                const toolResults: ToolCallRecord[] = steps.flatMap((step) =>
                    step.toolResults.map((toolResult) => ({ toolName: toolResult.toolName, output: toolResult.output })),
                )
                const meta = buildPortfolioMeta(toolResults)
                if (hasPortfolioMeta(meta)) {
                    writer.write({ type: "data-portfolio", data: meta })
                }
            } catch {
                // The underlying generation failed — the merged stream above already
                // surfaced a friendly error part and logged it; nothing more to attach.
            }
        },
        onError: friendlyStreamError,
    })

    return createUIMessageStreamResponse({ stream })
}
