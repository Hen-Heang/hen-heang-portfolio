import { createClient } from "@/src/lib/supabase/server"
import { requireOwner } from "@/src/lib/admin/require-owner"

const jsonError = (message: string, status: number) => Response.json({ error: message }, { status })

/**
 * Triggers a GitHub sync for one knowledge source. No GitHub API integration
 * exists yet, so this records an honest stub run rather than pretending to
 * sync — the UI, auth, and persisted result are all real; only the fetch
 * from GitHub itself is not implemented.
 *
 * Owner authorization is re-checked here independently of the admin layout
 * gate via requireOwner(): a route can be invoked directly regardless of
 * what the UI shows, so hiding the "Sync now" button is not a substitute for
 * this check. Uses the request's own Supabase session (anon key + user JWT
 * via cookies) — no service-role key, no GitHub token, nothing
 * browser-exposed.
 */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const owner = await requireOwner()
    if (!owner.authorized) return jsonError("Not authorized.", owner.status ?? 401)

    const { id } = await params
    const supabase = await createClient()

    const { data: source, error: sourceError } = await supabase
        .from("portfolio_ai_sources")
        .select("id, source_type")
        .eq("id", id)
        .maybeSingle()

    if (sourceError) return jsonError("Could not look up that source.", 500)
    if (!source) return jsonError("Source not found.", 404)
    if (source.source_type !== "github_repo") {
        return jsonError("Only GitHub-repo sources can be synced.", 400)
    }

    const startedAt = new Date().toISOString()
    const { data: run, error: insertError } = await supabase
        .from("portfolio_ai_sync_runs")
        .insert({
            source_id: id,
            status: "failed",
            processed_count: 0,
            inserted_count: 0,
            updated_count: 0,
            deactivated_count: 0,
            error_summary: "GitHub sync isn't implemented yet — this is a stub run recorded by the manual trigger.",
            started_at: startedAt,
            finished_at: new Date().toISOString(),
        })
        .select("*")
        .single()

    if (insertError) return jsonError("Could not record the sync run.", 500)

    return Response.json({ run })
}
