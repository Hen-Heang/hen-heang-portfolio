"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2, Save } from "lucide-react"
import { createClient } from "@/src/lib/supabase/client"
import { SiteContentSchemas, type SiteContentKey } from "@/src/lib/schemas/content"

const KEYS: { key: SiteContentKey; label: string; hint: string }[] = [
    { key: "profile", label: "Profile & Personal Info", hint: "Name, title, hero copy, bio, and socials — used across the whole site" },
    { key: "cv", label: "CV / Resume", hint: "Everything on the /cv page" },
]

export function SiteContentEditor() {
    const [values, setValues] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState<string | null>(null)
    const [status, setStatus] = useState<Record<string, { ok: boolean; msg: string } | undefined>>({})

    const load = useCallback(async () => {
        const { data } = await createClient()
            .from("portfolio_site_content")
            .select("key, data")
        const next: Record<string, string> = {}
        for (const row of data ?? []) {
            next[row.key] = JSON.stringify(row.data, null, 2)
        }
        setValues(next)
        setLoading(false)
    }, [])

    useEffect(() => {
        void load()
    }, [load])

    async function handleSave(key: SiteContentKey) {
        let parsed: unknown
        try {
            parsed = JSON.parse(values[key] ?? "")
        } catch (e) {
            setStatus((s) => ({ ...s, [key]: { ok: false, msg: `Invalid JSON: ${(e as Error).message}` } }))
            return
        }

        const validation = SiteContentSchemas[key].safeParse(parsed)
        if (!validation.success) {
            const issues = validation.error.issues
                .map((issue) => `${key}${issue.path.length ? "." + issue.path.join(".") : ""}: ${issue.message}`)
                .join("; ")
            setStatus((s) => ({ ...s, [key]: { ok: false, msg: issues } }))
            return
        }

        setSaving(key)
        setStatus((s) => ({ ...s, [key]: undefined }))
        const { error } = await createClient()
            .from("portfolio_site_content")
            .upsert({ key, data: parsed, updated_at: new Date().toISOString() })
        setSaving(null)
        setStatus((s) => ({
            ...s,
            [key]: error ? { ok: false, msg: error.message } : { ok: true, msg: "Saved" },
        }))
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12 text-[#52525b]">
                <Loader2 size={16} className="animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {KEYS.map(({ key, label, hint }) => (
                <section key={key} className="bg-[#18181b] border border-[#27272a] rounded-2xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-[#27272a]">
                        <h2 className="text-[#fafafa] text-sm font-semibold">{label}</h2>
                        <p className="text-[#52525b] text-xs mt-0.5">{hint}</p>
                    </div>
                    <div className="p-5">
                        <textarea
                            value={values[key] ?? ""}
                            onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                            rows={16}
                            spellCheck={false}
                            className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#fafafa] outline-none focus:border-[#6366f1] transition-colors resize-y leading-relaxed"
                        />
                        <div className="mt-3 flex items-center gap-3">
                            <button
                                onClick={() => handleSave(key)}
                                disabled={saving === key}
                                className="flex items-center gap-1.5 bg-[#6366f1] hover:bg-[#5558e6] disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                            >
                                {saving === key ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                                Save
                            </button>
                            {status[key] && (
                                <span className={`text-xs ${status[key]!.ok ? "text-emerald-400" : "text-red-400"}`}>
                                    {status[key]!.msg}
                                </span>
                            )}
                        </div>
                    </div>
                </section>
            ))}
        </div>
    )
}
