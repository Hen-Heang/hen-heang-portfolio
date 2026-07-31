"use client"

import { useCallback, useEffect, useState } from "react"
import { ChevronDown, ChevronRight, Github, RefreshCw } from "lucide-react"
import { createClient } from "@/src/lib/supabase/client"
import { AISourceRowSchema, AIChunkRowSchema, AISyncRunRowSchema } from "@/src/lib/schemas/ai-knowledge"
import type { AISource, AIChunk, AISyncRun, AIApprovalStatus, AIVisibility } from "@/src/lib/types/ai-knowledge"
import { Badge, EmptyState, ErrorBanner, LoadingState, SafeTextPreview, SuccessBanner, formatTimestamp } from "./shared"

function approvalTone(status: AIApprovalStatus) {
    if (status === "approved") return "positive" as const
    if (status === "rejected") return "negative" as const
    return "warning" as const
}

function syncStatusTone(status: AISyncRun["status"]) {
    if (status === "succeeded") return "positive" as const
    if (status === "failed") return "negative" as const
    return "warning" as const
}

export function KnowledgeSourcesPanel() {
    const [sources, setSources] = useState<AISource[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [notice, setNotice] = useState<string | null>(null)
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [chunksBySource, setChunksBySource] = useState<Record<string, AIChunk[]>>({})
    const [runsBySource, setRunsBySource] = useState<Record<string, AISyncRun[]>>({})
    const [detailLoading, setDetailLoading] = useState(false)
    const [syncingId, setSyncingId] = useState<string | null>(null)

    const load = useCallback(async () => {
        const { data, error: loadError } = await createClient()
            .from("portfolio_ai_sources")
            .select("*")
            .order("created_at", { ascending: false })

        if (loadError) {
            setError(loadError.message)
        } else {
            const parsed = (data ?? []).map((row) => AISourceRowSchema.safeParse(row))
            const valid = parsed.filter((p) => p.success).map((p) => p.data)
            if (parsed.some((p) => !p.success)) {
                setError("Some source rows didn't match the expected shape and were skipped.")
            }
            setSources(valid)
        }
        setLoading(false)
    }, [])

    useEffect(() => {
        // Remote data is intentionally loaded when this client-only panel mounts.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void load()
    }, [load])

    async function loadDetail(sourceId: string) {
        setDetailLoading(true)
        const supabase = createClient()

        const [{ data: chunkRows, error: chunkError }, { data: runRows, error: runError }] = await Promise.all([
            supabase
                .from("portfolio_ai_chunks")
                .select("*")
                .eq("source_id", sourceId)
                .order("updated_at", { ascending: false })
                .limit(5),
            supabase
                .from("portfolio_ai_sync_runs")
                .select("*")
                .eq("source_id", sourceId)
                .order("started_at", { ascending: false })
                .limit(5),
        ])

        if (chunkError || runError) {
            setError((chunkError ?? runError)!.message)
        } else {
            setChunksBySource((prev) => ({
                ...prev,
                [sourceId]: (chunkRows ?? []).map((r) => AIChunkRowSchema.parse(r)),
            }))
            setRunsBySource((prev) => ({
                ...prev,
                [sourceId]: (runRows ?? []).map((r) => AISyncRunRowSchema.parse(r)),
            }))
        }
        setDetailLoading(false)
    }

    function toggleExpand(source: AISource) {
        const next = expandedId === source.id ? null : source.id
        setExpandedId(next)
        setError(null)
        if (next && !chunksBySource[next]) void loadDetail(next)
    }

    async function setVisibility(source: AISource, visibility: AIVisibility) {
        setError(null)
        const { error: updateError } = await createClient()
            .from("portfolio_ai_sources")
            .update({ visibility })
            .eq("id", source.id)
        if (updateError) {
            setError(updateError.message)
            return
        }
        setSources((prev) => prev.map((s) => (s.id === source.id ? { ...s, visibility } : s)))
    }

    async function setApproval(source: AISource, approvalStatus: AIApprovalStatus) {
        setError(null)
        const { error: updateError } = await createClient()
            .from("portfolio_ai_sources")
            .update({ approval_status: approvalStatus })
            .eq("id", source.id)
        if (updateError) {
            setError(updateError.message)
            return
        }
        setSources((prev) => prev.map((s) => (s.id === source.id ? { ...s, approvalStatus } : s)))
    }

    async function triggerSync(source: AISource) {
        setError(null)
        setNotice(null)
        setSyncingId(source.id)
        try {
            const res = await fetch(`/api/admin/ai-sources/${source.id}/sync`, { method: "POST" })
            const body = await res.json()
            if (!res.ok) {
                setError(body.error ?? "Sync trigger failed.")
                return
            }
            setNotice(`Sync run recorded for "${source.title}".`)
            await loadDetail(source.id)
        } catch {
            setError("Could not reach the sync endpoint.")
        } finally {
            setSyncingId(null)
        }
    }

    return (
        <section className="bg-[#18181b] border border-[#27272a] rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#27272a]">
                <h2 className="text-[#fafafa] text-sm font-semibold">
                    Knowledge Sources
                    <span className="ml-2 text-[#52525b] text-xs font-normal">{sources.length}</span>
                </h2>
            </div>

            {error && <ErrorBanner message={error} />}
            {notice && <SuccessBanner message={notice} />}

            {loading ? (
                <LoadingState />
            ) : sources.length === 0 ? (
                <EmptyState>No knowledge sources yet.</EmptyState>
            ) : (
                <ul className="divide-y divide-[#27272a]">
                    {sources.map((source) => (
                        <li key={source.id}>
                            <div className="flex flex-wrap items-center gap-3 px-5 py-3">
                                <button
                                    onClick={() => toggleExpand(source)}
                                    className="text-[#71717a] hover:text-[#fafafa] transition-colors shrink-0"
                                    aria-label={expandedId === source.id ? "Collapse" : "Expand"}
                                >
                                    {expandedId === source.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                </button>

                                <div className="flex-1 min-w-0 flex flex-wrap items-center gap-x-2 gap-y-1">
                                    <span className="text-[#fafafa] text-sm font-medium truncate">{source.title}</span>
                                    <Badge tone="neutral">{source.sourceType.replace("_", " ")}</Badge>
                                    <Badge tone={source.visibility === "public" ? "positive" : "neutral"}>{source.visibility}</Badge>
                                    <Badge tone={approvalTone(source.approvalStatus)}>{source.approvalStatus}</Badge>
                                </div>

                                <div className="flex items-center gap-2 text-[10px] text-[#52525b] shrink-0">
                                    <span>synced {formatTimestamp(source.lastSyncedAt)}</span>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                    {source.approvalStatus !== "approved" && (
                                        <button
                                            onClick={() => setApproval(source, "approved")}
                                            className="text-[10px] font-semibold text-emerald-400 hover:text-emerald-300 px-2 py-1 rounded-md hover:bg-emerald-400/10 transition-colors"
                                        >
                                            Approve
                                        </button>
                                    )}
                                    {source.approvalStatus !== "rejected" && (
                                        <button
                                            onClick={() => setApproval(source, "rejected")}
                                            className="text-[10px] font-semibold text-red-400 hover:text-red-300 px-2 py-1 rounded-md hover:bg-red-400/10 transition-colors"
                                        >
                                            Reject
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setVisibility(source, source.visibility === "public" ? "owner" : "public")}
                                        className="text-[10px] font-semibold text-[#71717a] hover:text-[#fafafa] px-2 py-1 rounded-md hover:bg-[#27272a] transition-colors"
                                    >
                                        Make {source.visibility === "public" ? "owner-only" : "public"}
                                    </button>
                                    {source.sourceType === "github_repo" && (
                                        <button
                                            onClick={() => triggerSync(source)}
                                            disabled={syncingId === source.id}
                                            className="flex items-center gap-1 text-[10px] font-semibold text-[#71717a] hover:text-[#fafafa] px-2 py-1 rounded-md hover:bg-[#27272a] transition-colors disabled:opacity-50"
                                        >
                                            <RefreshCw size={11} className={syncingId === source.id ? "animate-spin" : ""} />
                                            Sync now
                                        </button>
                                    )}
                                </div>
                            </div>

                            {expandedId === source.id && (
                                <div className="px-5 pb-4 pl-11 space-y-4">
                                    <div className="flex items-center gap-3 text-[10px] text-[#52525b]">
                                        <span className="flex items-center gap-1">
                                            <Github size={11} />
                                            <a href={source.sourceUrl} target="_blank" rel="noreferrer" className="hover:text-[#a1a1aa] underline">
                                                {source.sourceUrl}
                                            </a>
                                        </span>
                                        <span>updated {formatTimestamp(source.updatedAt)}</span>
                                    </div>

                                    {detailLoading ? (
                                        <LoadingState />
                                    ) : (
                                        <>
                                            <div>
                                                <h3 className="text-[#71717a] text-[10px] font-semibold uppercase tracking-wider mb-2">
                                                    Preview (most recent chunks)
                                                </h3>
                                                {(chunksBySource[source.id]?.length ?? 0) === 0 ? (
                                                    <p className="text-[#52525b] text-xs">No chunks synced for this source yet.</p>
                                                ) : (
                                                    <ul className="space-y-3">
                                                        {chunksBySource[source.id].map((chunk) => (
                                                            <li key={chunk.id} className="bg-[#0c0c0e] border border-[#27272a] rounded-lg px-3 py-2.5">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    {chunk.title && <span className="text-[#a1a1aa] text-xs font-medium">{chunk.title}</span>}
                                                                    <Badge tone={chunk.approved ? "positive" : "warning"}>{chunk.approved ? "approved" : "pending"}</Badge>
                                                                    {!chunk.isActive && <Badge tone="negative">inactive</Badge>}
                                                                </div>
                                                                <SafeTextPreview text={chunk.content} />
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>

                                            <div>
                                                <h3 className="text-[#71717a] text-[10px] font-semibold uppercase tracking-wider mb-2">
                                                    Sync history
                                                </h3>
                                                {(runsBySource[source.id]?.length ?? 0) === 0 ? (
                                                    <p className="text-[#52525b] text-xs">No sync runs recorded yet.</p>
                                                ) : (
                                                    <ul className="space-y-1.5">
                                                        {runsBySource[source.id].map((run) => (
                                                            <li key={run.id} className="flex flex-wrap items-center gap-2 text-xs">
                                                                <Badge tone={syncStatusTone(run.status)}>{run.status}</Badge>
                                                                <span className="text-[#52525b]">{formatTimestamp(run.startedAt)}</span>
                                                                <span className="text-[#52525b]">
                                                                    {run.processedCount} processed · {run.insertedCount} inserted · {run.updatedCount} updated
                                                                </span>
                                                                {run.errorSummary && <SafeTextPreview text={run.errorSummary} maxLength={200} />}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </section>
    )
}
