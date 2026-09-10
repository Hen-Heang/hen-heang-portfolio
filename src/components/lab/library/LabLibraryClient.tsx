"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { ArrowRight, Search, SlidersHorizontal, X } from "lucide-react"
import type { EngineeringLabSearchItem, EngineeringLabSource } from "@/src/lib/types/engineering-lab"
import { LAB_CONTENT_TYPES, rankLabSearch, type LabContentType } from "@/src/lib/lab/search"
import { Tag } from "@/src/components/ai-engineering/Tag"

const sourceTextColors: Record<EngineeringLabSource, string> = {
    "Agent Handbook": "text-brand",
    "AI Engineering": "text-brand",
    "AX Engineering": "text-warning",
    "Backend Engineering": "text-success",
    "DevOps Basics": "text-warning",
}

const DIFFICULTIES: { value: EngineeringLabSearchItem["difficulty"] & string; label: string }[] = [
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" },
]

const SOURCES: EngineeringLabSource[] = ["Agent Handbook", "Backend Engineering", "DevOps Basics", "AX Engineering", "AI Engineering"]

function readParam(params: URLSearchParams, key: string): string {
    return params.get(key) ?? ""
}

export function LabLibraryClient({ items }: { items: EngineeringLabSearchItem[] }) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const inputRef = useRef<HTMLInputElement>(null)

    const [query, setQuery] = useState(() => readParam(searchParams, "q"))
    const contentType = (readParam(searchParams, "type") || undefined) as LabContentType | undefined
    const difficulty = (readParam(searchParams, "difficulty") || undefined) as EngineeringLabSearchItem["difficulty"]
    const source = (readParam(searchParams, "source") || undefined) as EngineeringLabSource | undefined

    // `/` focuses search unless the user is already typing in a form field.
    useEffect(() => {
        function onKeyDown(event: KeyboardEvent) {
            if (event.key !== "/") return
            const target = event.target as HTMLElement | null
            const isEditable = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable
            if (isEditable) return
            event.preventDefault()
            inputRef.current?.focus()
        }
        window.addEventListener("keydown", onKeyDown)
        return () => window.removeEventListener("keydown", onKeyDown)
    }, [])

    const updateParams = useCallback(
        (next: Record<string, string | undefined>) => {
            const params = new URLSearchParams(searchParams.toString())
            for (const [key, value] of Object.entries(next)) {
                if (value) params.set(key, value)
                else params.delete(key)
            }
            router.push(`${pathname}${params.toString() ? `?${params}` : ""}`, { scroll: false })
        },
        [pathname, router, searchParams],
    )

    // Debounce the query → URL sync so typing doesn't spam history.
    useEffect(() => {
        const handle = setTimeout(() => {
            if (query !== readParam(searchParams, "q")) updateParams({ q: query || undefined })
        }, 250)
        return () => clearTimeout(handle)
        // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-sync when the debounced query itself changes
    }, [query])

    const results = useMemo(
        () => rankLabSearch(query, items, { contentType, difficulty, source, limit: 200 }),
        [items, query, contentType, difficulty, source],
    )

    const activeFilterCount = [contentType, difficulty, source].filter(Boolean).length
    const hasAnyFilter = activeFilterCount > 0 || query.length > 0

    function clearAll() {
        setQuery("")
        router.push(pathname, { scroll: false })
    }

    return (
        <div>
            <div className="mb-4">
                <div className="relative max-w-xl">
                    <Search size={16} aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-fg-muted" />
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search Java, Spring Security, Docker… (press / to focus)"
                        aria-label="Search the Engineering Lab library"
                        className="min-h-12 w-full rounded-2xl border border-border bg-surface py-3 pl-11 pr-11 text-base text-fg outline-none transition-colors placeholder:text-fg-muted focus:border-brand focus:ring-2 focus:ring-brand/15"
                    />
                    {query && (
                        <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-fg-muted transition-colors hover:bg-surface-elevated hover:text-fg">
                            <X size={15} aria-hidden="true" />
                        </button>
                    )}
                </div>
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-2" role="group" aria-label="Content type">
                <FilterTab active={!contentType} label="All" onClick={() => updateParams({ type: undefined })} />
                {LAB_CONTENT_TYPES.map((type) => (
                    <FilterTab key={type.value} active={contentType === type.value} label={type.label} onClick={() => updateParams({ type: contentType === type.value ? undefined : type.value })} />
                ))}
            </div>

            <details className="mb-6 rounded-xl border border-border bg-surface p-3.5 open:pb-4">
                <summary className="flex min-h-8 cursor-pointer list-none items-center gap-2 marker:content-none">
                    <SlidersHorizontal size={14} aria-hidden="true" className="text-fg-muted" />
                    <span className="text-base font-medium text-fg-secondary">More filters</span>
                    {activeFilterCount > (contentType ? 1 : 0) && (
                        <span className="rounded-full bg-brand/10 px-2 py-0.5 font-mono text-[11px] text-brand">
                            {activeFilterCount - (contentType ? 1 : 0)} active
                        </span>
                    )}
                </summary>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <select
                        value={difficulty ?? ""}
                        onChange={(event) => updateParams({ difficulty: event.target.value || undefined })}
                        aria-label="Filter by difficulty"
                        className="min-h-11 w-full rounded-lg border border-border bg-background px-3 text-base capitalize text-fg-secondary outline-none focus:border-brand"
                    >
                        <option value="">All difficulties</option>
                        {DIFFICULTIES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                    </select>
                    <select
                        value={source ?? ""}
                        onChange={(event) => updateParams({ source: event.target.value || undefined })}
                        aria-label="Filter by source"
                        className="min-h-11 w-full rounded-lg border border-border bg-background px-3 text-base text-fg-secondary outline-none focus:border-brand"
                    >
                        <option value="">All sources</option>
                        {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </details>

            {hasAnyFilter && (
                <button type="button" onClick={clearAll} className="mb-4 inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg">
                    <X size={12} aria-hidden="true" /> Clear all filters
                </button>
            )}

            <p aria-live="polite" className="mb-4 font-mono text-sm text-fg-muted">{results.length} result{results.length === 1 ? "" : "s"}</p>

            {results.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border py-16 text-center">
                    <p className="text-base font-semibold text-fg">Nothing matches yet</p>
                    <p className="mt-1 text-base text-fg-muted">Try a broader term or clear a filter.</p>
                </div>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                    {results.map((item) => (
                        <Link
                            key={`${item.source}-${item.type}-${item.href}-${item.title}`}
                            href={item.href}
                            className="group flex flex-col gap-2 rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-border-strong"
                        >
                            <div className="flex items-center justify-between gap-2">
                                <span className={`font-mono text-xs font-semibold uppercase tracking-wider ${sourceTextColors[item.source]}`}>
                                    {item.source} · {item.type}
                                </span>
                                <ArrowRight size={13} aria-hidden="true" className="shrink-0 text-border-strong transition-all group-hover:translate-x-1 group-hover:text-brand" />
                            </div>
                            <h3 className="text-lg font-semibold text-fg">{item.title}</h3>
                            <p className="text-base leading-relaxed text-fg-secondary line-clamp-2">{item.description}</p>
                            <div className="flex flex-wrap items-center gap-1.5">
                                {item.difficulty && <Tag label={item.difficulty} />}
                                {item.tags.slice(0, 2).map((t) => <Tag key={t} label={t} />)}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}

function FilterTab({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            className={`min-h-9 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                active ? "bg-brand text-brand-foreground" : "bg-surface-hover text-fg-secondary hover:text-fg"
            }`}
        >
            {label}
        </button>
    )
}
