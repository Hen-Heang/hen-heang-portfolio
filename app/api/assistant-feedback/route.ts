import { createHash } from "node:crypto"

import { createRateLimiter } from "@/src/lib/rate-limit/factory"
import { clientKeyFromRequest } from "@/src/lib/rate-limit/client-key"
import { validateFeedbackBody } from "@/src/lib/ai/feedback-validation"
import { getSupabaseClient } from "@/src/lib/supabase"

const feedbackLimiter = createRateLimiter("assistant-feedback", 60_000, 20)
/** Stricter limit for submissions that include a correction — a larger, more abuse-prone payload than a plain vote. */
const correctionLimiter = createRateLimiter("assistant-feedback-correction", 60_000, 5)

const jsonError = (message: string, status: number) => Response.json({ error: message }, { status })

const hashClientKey = (clientKey: string): string => createHash("sha256").update(clientKey).digest("hex").slice(0, 24)

/**
 * Privacy-safe "was this helpful?" signal: a vote, a coarse page hint, and an
 * optional free-text correction — never the underlying question/answer text.
 *
 * Persists to portfolio_ai_feedback (public-insert-only per RLS — see
 * supabase/migrations/20260731090000_portfolio_ai_knowledge_schema.sql) so
 * an owner can review it later via /api/assistant-feedback/review. A
 * correction is stored as a DRAFT only: it is never publicly readable and
 * never influences what the assistant says until an owner explicitly
 * approves it (see app/api/assistant-feedback/review/route.ts and
 * data/knowledge/corrections.ts) — nothing here creates "automatic learning"
 * from visitor conversations.
 *
 * The table name below is a fixed literal, never derived from request
 * input — this route can never be redirected at an arbitrary table.
 */
export async function POST(req: Request) {
    const clientKey = clientKeyFromRequest(req)
    const rate = await feedbackLimiter.check(clientKey)
    if (!rate.allowed) {
        return jsonError("Too many feedback submissions.", 429)
    }

    let body: unknown
    try {
        body = await req.json()
    } catch {
        return jsonError("Invalid request body.", 400)
    }

    const validation = validateFeedbackBody(body)
    if (!validation.ok || !validation.requestId || !validation.page || !validation.vote) {
        return jsonError(validation.error ?? "Invalid request.", 400)
    }

    if (validation.correction) {
        const correctionRate = await correctionLimiter.check(clientKey)
        if (!correctionRate.allowed) {
            return jsonError("Too many corrections submitted — please wait a moment and try again.", 429)
        }
    }

    const clientHash = hashClientKey(clientKey)

    // Content-free: vote, page, hashed client id, and whether a correction was
    // attached — never the correction text itself, never a raw IP.
    console.log(
        JSON.stringify({
            event: "assistant_feedback",
            vote: validation.vote,
            page: validation.page,
            hasCorrection: Boolean(validation.correction),
            client: clientHash,
            ts: new Date().toISOString(),
        }),
    )

    const sb = getSupabaseClient()
    if (sb) {
        const { error } = await sb.from("portfolio_ai_feedback").insert({
            request_id: validation.requestId,
            page_context: validation.page,
            vote: validation.vote,
            correction: validation.correction ?? null,
            client_hash: clientHash,
        })
        // Best-effort: feedback persistence must never break the chat UX, and
        // the failure reason is never surfaced to the client.
        if (error) {
            console.warn(JSON.stringify({ event: "assistant_feedback_persist_failed", ts: new Date().toISOString() }))
        }
    }

    return Response.json({ ok: true })
}
