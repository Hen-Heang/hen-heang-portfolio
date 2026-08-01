import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient | null {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) return null
    if (!_client) _client = createClient(url, key)
    return _client
}

// Keep backward-compat export — returns null when env vars are absent (e.g. during SSG).
// Checked for truthiness, not just `typeof === 'string'`: a var that is defined
// but empty would otherwise reach createClient(''), which throws at module
// evaluation and 500s every page that imports this transitively.
export const supabase = getSupabaseClient()
