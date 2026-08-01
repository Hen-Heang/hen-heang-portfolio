"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2, ThumbsDown, ThumbsUp } from "lucide-react"
import { AIFeedbackRowSchema } from "@/src/lib/schemas/ai-knowledge"
import type { AIFeedback } from "@/src/lib/types/ai-knowledge"
import type { KnowledgeCategory } from "@/data/knowledge"
import { Badge, EmptyState, ErrorBanner, KNOWLEDGE_CATEGORIES, LoadingState, SafeTextPreview, SuccessBanner, formatTimestamp } from "./shared"

function evaluationTone(status: AIFeedback["evaluationStatus"]) {
    if (status === "actioned") return "positive" as const
    if (status === "dismissed") return "negative" as const
    if (status === "reviewed") return "neutral" as const
    return "warning" as const
}

export function FeedbackReviewPanel() {
    const [feedback, setFeedback] = useState<AIFeedback[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [notice, setNotice] = useState<string | null>(null)
    const [showAll, setShowAll] = useState(false)
    const [busyId, setBusyId] = useState<string | null>(null)
    const [categoryChoice, setCategoryChoice] = useState<Record<string, KnowledgeCategory>>({})

    const load = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch("/api/assistant-feedback/review")
            const body = await res.json()
            if (!res.ok) {
                setError(body.error ?? "Failed to load feedback.")
                setLoading(false)
                return
            }
            const parsed = ((body.feedback ?? []) as unknown[]).map((row) => AIFeedbackRowSchema.safeParse(row))
            setFeedback(parsed.filter((p) => p.success).map((p) => p.data))
        } catch {
            setError("Could not reach the feedback review endpoint.")
        }
        setLoading(false)
    }, [])

    useEffect(() => {
        // Remote data is intentionally loaded when this client-only panel mounts.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void load()
    }, [load])

    async function runAction(
        item: AIFeedback,
        action: "approve" | "reject" | "acknowledge",
        category?: KnowledgeCategory,
    ) {
        setError(null)
        setNotice(null)
        setBusyId(item.id)
        try {
            const res = await fetch("/api/assistant-feedback/review", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ feedbackId: item.id, action, category }),
            })
            const body = await res.json()
            if (!res.ok) {
                setError(body.error ?? "Action failed.")
                return
            }
            setNotice(
                action === "approve"
                    ? "Correction approved and added to the assistant's knowledge."
                    : action === "reject"
                        ? "Correction rejected."
                        : "Marked as reviewed.",
            )
            await load()
        } catch {
            setError("Could not reach the feedback review endpoint.")
        } finally {
            setBusyId(null)
        }
    }

    const visible = showAll ? feedback : feedback.filter((f) => f.vote === "down")

    return (
        <section className="bg-[#18181b] border border-[#27272a] rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#27272a]">
                <h2 className="text-[#fafafa] text-sm font-semibold">
                    Feedback Review
                    <span className="ml-2 text-[#52525b] text-xs font-normal">{visible.length}</span>
                </h2>
                <button
                    onClick={() => setShowAll((prev) => !prev)}
                    className="text-[10px] font-semibold text-[#71717a] hover:text-[#fafafa] px-2 py-1 rounded-md hover:bg-[#27272a] transition-colors"
                >
                    {showAll ? "Show negative only" : "Show all votes"}
                </button>
            </div>

            {error && <ErrorBanner message={error} />}
            {notice && <SuccessBanner message={notice} />}

            {loading ? (
                <LoadingState />
            ) : visible.length === 0 ? (
                <EmptyState>{showAll ? "No feedback yet." : "No negative feedback to review."}</EmptyState>
            ) : (
                <ul className="divide-y divide-[#27272a]">
                    {visible.map((item) => (
                        <li key={item.id} className="px-5 py-3">
                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                {item.vote === "down" ? (
                                    <ThumbsDown size={13} className="text-red-400 shrink-0" />
                                ) : (
                                    <ThumbsUp size={13} className="text-emerald-400 shrink-0" />
                                )}
                                <Badge tone="neutral">{item.pageContext}</Badge>
                                <Badge tone={evaluationTone(item.evaluationStatus)}>{item.evaluationStatus}</Badge>
                                <span className="text-[#3f3f46] text-[10px]">{formatTimestamp(item.createdAt)}</span>
                            </div>

                            {item.correction && <SafeTextPreview text={item.correction} />}

                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                {item.correction ? (
                                    <>
                                        <select
                                            value={categoryChoice[item.id] ?? "faq"}
                                            onChange={(e) =>
                                                setCategoryChoice((prev) => ({ ...prev, [item.id]: e.target.value as KnowledgeCategory }))
                                            }
                                            disabled={busyId === item.id}
                                            className="bg-[#09090b] border border-[#27272a] rounded-md px-2 py-1 text-[10px] text-[#a1a1aa] outline-none focus:border-[#6366f1]"
                                        >
                                            {KNOWLEDGE_CATEGORIES.map((c) => (
                                                <option key={c} value={c}>
                                                    {c}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={() => runAction(item, "approve", categoryChoice[item.id] ?? "faq")}
                                            disabled={busyId === item.id}
                                            className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 hover:text-emerald-300 px-2 py-1 rounded-md hover:bg-emerald-400/10 transition-colors disabled:opacity-50"
                                        >
                                            {busyId === item.id && <Loader2 size={10} className="animate-spin" />}
                                            Approve correction
                                        </button>
                                        <button
                                            onClick={() => runAction(item, "reject")}
                                            disabled={busyId === item.id}
                                            className="text-[10px] font-semibold text-red-400 hover:text-red-300 px-2 py-1 rounded-md hover:bg-red-400/10 transition-colors disabled:opacity-50"
                                        >
                                            Reject
                                        </button>
                                    </>
                                ) : (
                                    item.evaluationStatus === "pending" && (
                                        <button
                                            onClick={() => runAction(item, "acknowledge")}
                                            disabled={busyId === item.id}
                                            className="text-[10px] font-semibold text-[#71717a] hover:text-[#fafafa] px-2 py-1 rounded-md hover:bg-[#27272a] transition-colors disabled:opacity-50"
                                        >
                                            Mark reviewed
                                        </button>
                                    )
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    )
}
