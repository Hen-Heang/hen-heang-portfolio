"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react"
import { createClient } from "@/src/lib/supabase/client"
import { AIProfileFactRowSchema } from "@/src/lib/schemas/ai-knowledge"
import type { AIProfileFact, AIFactStatus, AIVisibility } from "@/src/lib/types/ai-knowledge"
import type { KnowledgeCategory } from "@/data/knowledge"
import { Badge, EmptyState, ErrorBanner, KNOWLEDGE_CATEGORIES, LoadingState, formatTimestamp } from "./shared"

function statusTone(status: AIFactStatus) {
    if (status === "approved") return "positive" as const
    if (status === "rejected") return "negative" as const
    return "warning" as const
}

interface FormState {
    category: KnowledgeCategory
    factText: string
    visibility: AIVisibility
}

const emptyForm: FormState = { category: "profile", factText: "", visibility: "owner" }

export function ProfileFactsPanel() {
    const [facts, setFacts] = useState<AIProfileFact[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [editing, setEditing] = useState<AIProfileFact | "new" | null>(null)
    const [form, setForm] = useState<FormState>(emptyForm)
    const [saving, setSaving] = useState(false)

    const load = useCallback(async () => {
        const { data, error: loadError } = await createClient()
            .from("portfolio_ai_profile_facts")
            .select("*")
            .order("updated_at", { ascending: false })

        if (loadError) {
            setError(loadError.message)
        } else {
            const parsed = (data ?? []).map((row) => AIProfileFactRowSchema.safeParse(row))
            setFacts(parsed.filter((p) => p.success).map((p) => p.data))
        }
        setLoading(false)
    }, [])

    useEffect(() => {
        // Remote data is intentionally loaded when this client-only panel mounts.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void load()
    }, [load])

    function startEdit(fact: AIProfileFact | "new") {
        setError(null)
        setEditing(fact)
        setForm(fact === "new" ? emptyForm : { category: fact.category, factText: fact.factText, visibility: fact.visibility })
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault()
        if (form.factText.trim().length === 0) {
            setError("Fact text can't be empty.")
            return
        }
        setError(null)
        setSaving(true)

        const payload = { category: form.category, fact_text: form.factText.trim(), visibility: form.visibility }
        const supabase = createClient()
        const { error: saveError } =
            editing === "new"
                ? await supabase.from("portfolio_ai_profile_facts").insert({ ...payload, status: "draft" })
                : await supabase.from("portfolio_ai_profile_facts").update(payload).eq("id", (editing as AIProfileFact).id)

        setSaving(false)
        if (saveError) {
            setError(saveError.message)
            return
        }
        setEditing(null)
        await load()
    }

    async function setStatus(fact: AIProfileFact, status: AIFactStatus) {
        setError(null)
        const { error: updateError } = await createClient()
            .from("portfolio_ai_profile_facts")
            .update({ status })
            .eq("id", fact.id)
        if (updateError) {
            setError(updateError.message)
            return
        }
        setFacts((prev) => prev.map((f) => (f.id === fact.id ? { ...f, status } : f)))
    }

    async function handleDelete(fact: AIProfileFact) {
        if (!window.confirm(`Delete this fact permanently? Prefer "Reject" instead if you just want it out of the assistant's knowledge — that's reversible, this isn't.\n\n"${fact.factText.slice(0, 120)}"`)) {
            return
        }
        setError(null)
        const { error: deleteError } = await createClient().from("portfolio_ai_profile_facts").delete().eq("id", fact.id)
        if (deleteError) {
            setError(deleteError.message)
            return
        }
        setFacts((prev) => prev.filter((f) => f.id !== fact.id))
    }

    return (
        <section className="bg-[#18181b] border border-[#27272a] rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#27272a]">
                <h2 className="text-[#fafafa] text-sm font-semibold">
                    Profile Facts
                    <span className="ml-2 text-[#52525b] text-xs font-normal">{facts.length}</span>
                </h2>
                <button
                    onClick={() => startEdit("new")}
                    className="flex items-center gap-1.5 bg-[#6366f1] hover:bg-[#5558e6] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                >
                    <Plus size={12} />
                    New
                </button>
            </div>

            {error && <ErrorBanner message={error} />}

            {editing && (
                <form onSubmit={handleSave} className="px-5 py-4 border-b border-[#27272a] bg-[#0c0c0e]">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[#fafafa] text-xs font-semibold uppercase tracking-wider">
                            {editing === "new" ? "New fact" : "Edit fact"}
                        </h3>
                        <button type="button" onClick={() => setEditing(null)} aria-label="Cancel" className="text-[#52525b] hover:text-[#fafafa] transition-colors">
                            <X size={14} />
                        </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="fact-category" className="block text-[#a1a1aa] text-xs font-medium mb-1.5">
                                Category
                            </label>
                            <select
                                id="fact-category"
                                value={form.category}
                                onChange={(e) => setForm({ ...form, category: e.target.value as KnowledgeCategory })}
                                className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3.5 py-2.5 text-sm text-[#fafafa] outline-none focus:border-[#6366f1] transition-colors"
                            >
                                {KNOWLEDGE_CATEGORIES.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="fact-visibility" className="block text-[#a1a1aa] text-xs font-medium mb-1.5">
                                Visibility
                            </label>
                            <select
                                id="fact-visibility"
                                value={form.visibility}
                                onChange={(e) => setForm({ ...form, visibility: e.target.value as AIVisibility })}
                                className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3.5 py-2.5 text-sm text-[#fafafa] outline-none focus:border-[#6366f1] transition-colors"
                            >
                                <option value="owner">owner (not shown to visitors)</option>
                                <option value="public">public (eligible once approved)</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="fact-text" className="block text-[#a1a1aa] text-xs font-medium mb-1.5">
                                Fact text
                                <span className="text-[#6366f1] ml-0.5">*</span>
                            </label>
                            <textarea
                                id="fact-text"
                                rows={3}
                                required
                                value={form.factText}
                                onChange={(e) => setForm({ ...form, factText: e.target.value })}
                                className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3.5 py-2.5 text-sm text-[#fafafa] placeholder-[#3f3f46] outline-none focus:border-[#6366f1] transition-colors resize-y"
                                placeholder="A short, plain statement of fact the assistant may state."
                            />
                        </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-1.5 bg-[#6366f1] hover:bg-[#5558e6] disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                        >
                            {saving && <Loader2 size={12} className="animate-spin" />}
                            Save
                        </button>
                        <button type="button" onClick={() => setEditing(null)} className="text-[#71717a] hover:text-[#fafafa] text-xs font-medium px-3 py-2 transition-colors">
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {loading ? (
                <LoadingState />
            ) : facts.length === 0 ? (
                <EmptyState>No profile facts yet — new facts start as drafts until approved.</EmptyState>
            ) : (
                <ul className="divide-y divide-[#27272a]">
                    {facts.map((fact) => (
                        <li key={fact.id} className="flex flex-wrap items-center gap-3 px-5 py-3 hover:bg-[#1c1c1f] transition-colors">
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <Badge tone="neutral">{fact.category}</Badge>
                                    <Badge tone={statusTone(fact.status)}>{fact.status}</Badge>
                                    <Badge tone={fact.visibility === "public" ? "positive" : "neutral"}>{fact.visibility}</Badge>
                                    <span className="text-[#3f3f46] text-[10px]">updated {formatTimestamp(fact.updatedAt)}</span>
                                </div>
                                <p className="text-[#a1a1aa] text-sm truncate">{fact.factText}</p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                                {fact.status !== "approved" && (
                                    <button
                                        onClick={() => setStatus(fact, "approved")}
                                        className="text-[10px] font-semibold text-emerald-400 hover:text-emerald-300 px-2 py-1 rounded-md hover:bg-emerald-400/10 transition-colors"
                                    >
                                        Approve
                                    </button>
                                )}
                                {fact.status !== "rejected" && (
                                    <button
                                        onClick={() => setStatus(fact, "rejected")}
                                        className="text-[10px] font-semibold text-red-400 hover:text-red-300 px-2 py-1 rounded-md hover:bg-red-400/10 transition-colors"
                                    >
                                        Reject
                                    </button>
                                )}
                                <button onClick={() => startEdit(fact)} aria-label="Edit" className="text-[#71717a] hover:text-[#fafafa] transition-colors p-1.5">
                                    <Pencil size={13} />
                                </button>
                                <button onClick={() => handleDelete(fact)} aria-label="Delete" className="text-[#71717a] hover:text-red-400 transition-colors p-1.5">
                                    <Trash2 size={13} />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    )
}
