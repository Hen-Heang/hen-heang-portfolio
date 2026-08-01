import "server-only"

import { createClient } from "@/src/lib/supabase/server"
import { OWNER_EMAIL } from "./config"

export interface OwnerCheckResult {
    authorized: boolean
    /** HTTP status a route should respond with when `authorized` is false. `null` when authorized. */
    status: 401 | 403 | null
}

/**
 * Server-side owner check for API routes, mirroring the same
 * getUser()+email comparison app/admin/(protected)/layout.tsx uses to gate
 * the admin UI — but as a reusable function, since (per that layout's own
 * comment) the real security boundary is Postgres RLS via
 * portfolio_is_owner(), and this is meant purely as a fast, explicit,
 * defense-in-depth check in front of it, not a replacement for it.
 *
 * Uses `createClient()` from src/lib/supabase/server.ts — the cookie-bound
 * anon-key client — never the service-role client, so RLS still applies to
 * every query a caller makes after this check passes.
 */
export async function requireOwner(): Promise<OwnerCheckResult> {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { authorized: false, status: 401 }
    if (user.email !== OWNER_EMAIL) return { authorized: false, status: 403 }
    return { authorized: true, status: null }
}
