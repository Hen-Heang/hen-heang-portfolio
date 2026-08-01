import { getSupabaseClient } from "@/src/lib/supabase"
import type { AIProfileFact } from "@/src/lib/types/ai-knowledge"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapProfileFact(r: any): AIProfileFact {
    return {
        id: r.id,
        category: r.category,
        factText: r.fact_text,
        supportingSourceId: r.supporting_source_id ?? null,
        visibility: r.visibility,
        status: r.status,
        validFrom: r.valid_from ?? null,
        validUntil: r.valid_until ?? null,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
    }
}

/**
 * Fetches owner-approved profile facts (the promoted form of an
 * owner-approved visitor correction — see app/api/assistant-feedback/review)
 * for the live knowledge base.
 *
 * Deliberately uses the PUBLIC anon-key client (getSupabaseClient), never the
 * service-role client: the "public read approved facts" RLS policy on
 * portfolio_ai_profile_facts (supabase/migrations/20260731090000_portfolio_ai_knowledge_schema.sql)
 * already restricts anon reads to visibility='public' AND status='approved'
 * AND currently within the fact's valid_from/valid_until window. Swapping in
 * the service-role client here would bypass that and could leak draft or
 * owner-only corrections into what the assistant tells visitors.
 */
export async function getApprovedProfileFacts(): Promise<AIProfileFact[]> {
    const sb = getSupabaseClient()
    if (!sb) return []
    const { data, error } = await sb
        .from("portfolio_ai_profile_facts")
        .select("*")
        .order("updated_at", { ascending: false })
    if (error || !data) return []
    return data.map(mapProfileFact)
}
