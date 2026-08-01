import "server-only"

import { requireOwner } from "@/src/lib/admin/require-owner"
import { createClient } from "@/src/lib/supabase/server"
import { createRateLimiter } from "@/src/lib/rate-limit/factory"
import { clientKeyFromRequest } from "@/src/lib/rate-limit/client-key"
import { validateReviewAction } from "@/src/lib/ai/feedback-validation"

/** Generous but bounded — defends against a scripting bug or a compromised session, not normal owner use. */
const reviewLimiter = createRateLimiter("assistant-feedback-review", 60_000, 30)

const EVALUATION_STATUS_FILTER = ["pending", "reviewed", "actioned", "dismissed"] as const

const jsonError = (message: string, status: number) => Response.json({ error: message }, { status })

/**
 * Owner-only feedback review/approval surface (no UI here — see the task
 * this shipped under). Every Supabase call below targets a fixed, hardcoded
 * table literal (`portfolio_ai_feedback` / `portfolio_ai_profile_facts`) —
 * never a client-supplied name — and runs through the cookie-bound anon-key
 * client, so Postgres RLS (owner-only policies, see
 * supabase/migrations/20260731090000_portfolio_ai_knowledge_schema.sql)
 * remains the authoritative enforcement even if the requireOwner() check
 * below had a bug.
 */
export async function GET(req: Request) {
    const owner = await requireOwner()
    if (!owner.authorized) return jsonError("Unauthorized.", owner.status ?? 401)

    const supabase = await createClient()
    const url = new URL(req.url)
    const statusFilter = url.searchParams.get("status")

    let query = supabase.from("portfolio_ai_feedback").select("*").order("created_at", { ascending: false }).limit(100)
    if (statusFilter && (EVALUATION_STATUS_FILTER as readonly string[]).includes(statusFilter)) {
        query = query.eq("evaluation_status", statusFilter)
    }

    const { data, error } = await query
    if (error) return jsonError("Failed to load feedback.", 500)
    return Response.json({ feedback: data ?? [] })
}

export async function POST(req: Request) {
    const owner = await requireOwner()
    if (!owner.authorized) return jsonError("Unauthorized.", owner.status ?? 401)

    const rate = await reviewLimiter.check(clientKeyFromRequest(req))
    if (!rate.allowed) return jsonError("Too many review actions — please wait a moment.", 429)

    let body: unknown
    try {
        body = await req.json()
    } catch {
        return jsonError("Invalid request body.", 400)
    }

    const validation = validateReviewAction(body)
    if (!validation.ok || !validation.feedbackId || !validation.action) {
        return jsonError(validation.error ?? "Invalid request.", 400)
    }

    const supabase = await createClient()

    const { data: feedbackRow, error: fetchError } = await supabase
        .from("portfolio_ai_feedback")
        .select("*")
        .eq("id", validation.feedbackId)
        .maybeSingle()

    if (fetchError) return jsonError("Failed to load feedback.", 500)
    if (!feedbackRow) return jsonError("Feedback not found.", 404)

    if (validation.action === "approve") {
        const factText = validation.factText ?? feedbackRow.correction
        if (!factText) {
            return jsonError("This feedback has no correction to approve.", 400)
        }

        const { error: insertError } = await supabase.from("portfolio_ai_profile_facts").insert({
            category: validation.category,
            fact_text: factText,
            visibility: "public",
            status: "approved",
            source_feedback_id: feedbackRow.id,
        })

        if (insertError) {
            // Postgres unique_violation — an identical fact already exists.
            if (insertError.code === "23505") return jsonError("An identical fact already exists.", 409)
            return jsonError("Failed to approve correction.", 500)
        }

        const { error: updateError } = await supabase
            .from("portfolio_ai_feedback")
            .update({ evaluation_status: "actioned" })
            .eq("id", feedbackRow.id)
        if (updateError) return jsonError("Correction was approved, but updating the feedback status failed.", 500)

        return Response.json({ ok: true })
    }

    const nextStatus = validation.action === "reject" ? "dismissed" : "reviewed"
    const { error: updateError } = await supabase
        .from("portfolio_ai_feedback")
        .update({ evaluation_status: nextStatus })
        .eq("id", feedbackRow.id)

    if (updateError) return jsonError("Failed to update feedback.", 500)
    return Response.json({ ok: true })
}
